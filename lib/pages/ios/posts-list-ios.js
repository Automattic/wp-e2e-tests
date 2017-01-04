import BaseContainerMobile from '../../base-container-mobile.js';
import webdriver from 'selenium-webdriver';
import curl from 'curlrequest';
import config from 'config';
import assert from 'assert';
const By = webdriver.By;

import * as driverHelper from '../../driver-helper.js';

export default class PostsListPage extends BaseContainerMobile {
	constructor( driver ) {
		super( driver, By.xpath( '//XCUIElementTypeTable[@name="PostsTable"]' ) );

		this.searchBarSelector = By.xpath( '//XCUIElementTypeOther[@name="Search"]' );
	}

	findPost( title ) {
		const driver = this.driver;

		return driverHelper.setWhenSettableMobile( driver, this.searchBarSelector, title ).then( () => {
			// This is actually returning the PostsTable itself, which isn't ideal but good enough verification for now.
			// Need to get real accessibility IDs applied to individual posts, but thus far I've been unsuccessful -- SRS -- 04Jan16
			const postElementSelector = By.xpath( `//XCUIElementTypeTable[starts-with(@label, "${title}")]` );

			return driverHelper.scrollToFindElement( driver, postElementSelector, { maxSwipes: 0 } ).then( () => {
				return true;
			}, () => {
				assert( false, `Unable to find post '${title}'` );
			} );
		} );
	}

	// NOTE: The posts on this page are basically inaccessible thanks to https://github.com/appium/appium/issues/6517
	//       - So for now the verification for seeing whether a post was successful is to manually query the public webpage and parse the results
	//       - If/when the Appium bug is fixed we should replace this with an actual verification of the post's presence at the top of the list
	_old_findPost( title, tagName ) {
		var siteName = config.get( 'testSiteforiOS' );
		var d = webdriver.promise.defer();

		var tryCurl = function( attemptNum ) {
			if ( attemptNum <= 0 ) {
				d.reject();
				assert( false, `Unable to verify post '${title}' with tag '${tagName}'` );
				return;
			}

			console.log( `Attempt #${attemptNum}` );
			curl.request( `${siteName}/tag/${tagName}/`, function( err, stdout ) {
				console.log( `...response #${attemptNum}` );
				if ( stdout.replace( /&nbsp;/g, ' ' ).match( title ) ) {
					d.fulfill();
				} else {
					setTimeout( function() {
						tryCurl( attemptNum - 1 );
					}, 5000 );
				}
			} );
		};

		tryCurl( 5 );

		return d.promise;
	}
}
