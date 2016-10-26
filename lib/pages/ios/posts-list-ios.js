import BaseContainerMobile from '../../base-container-mobile.js';
import webdriver from 'selenium-webdriver';
import curl from 'curlrequest';
import config from 'config';
import assert from 'assert';
const By = webdriver.By;

export default class PostsListPage extends BaseContainerMobile {
	constructor( driver ) {
		super( driver, By.xpath( '//UIATableView[@name="PostsTable"]' ) );
	}

	// NOTE: The posts on this page are basically inaccessible thanks to https://github.com/appium/appium/issues/6517
	//       - So for now the verification for seeing whether a post was successful is to manually query the public webpage and parse the results
	//       - If/when the Appium bug is fixed we should replace this with an actual verification of the post's presence at the top of the list
	findPost( title, tagName ) {
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
