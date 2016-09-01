import BaseContainerMobile from '../../base-container-mobile.js';
import webdriver from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper.js';

import curl from 'curlrequest';
import config from 'config';
import assert from 'assert';
const By = webdriver.By;

export default class PagesListPage extends BaseContainerMobile {
	constructor( driver ) {
		super( driver, By.xpath( '//UIATableView[@name="PagesTable"]' ) );
	}

	newPage() {
		var selector = By.xpath( '//UIAButton[@name="icon post add"]' );
		driverHelper.clickWhenClickableMobile( this.driver, selector );
	}

	// NOTE: The items on this page are basically inaccessible thanks to https://github.com/appium/appium/issues/6517
	//       - So for now the verification for seeing whether a post was successful is to manually query the public webpage and parse the results
	//       - If/when the Appium bug is fixed we should replace this with an actual verification of the post's presence at the top of the list
	findPage( title ) {
		const slug = title.replace( / /g, '-' ).toLowerCase();
		const siteName = config.get( 'testSiteforiOS' );

		var d = webdriver.promise.defer();

		var tryCurl = function( attemptNum ) {
console.log( `Query #${attemptNum}` );
			if ( attemptNum <= 0 ) {
				d.reject();
				assert( false, `Unable to verify page '${title}' exists` );
				return;
			}

			curl.request( `${siteName}/${slug}/`, function( err, stdout ) {
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
