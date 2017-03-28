import webdriver from 'selenium-webdriver';
import fs from 'fs-extra';
import config from 'config';

import * as mediaHelper from '../media-helper.js';
import * as driverManager from '../driver-manager.js';
import * as dataHelper from '../data-helper.js';

import GoogleSearchPage from '../pages/external/google-search.js';

export default class GoogleFlow {
	constructor( driver, screenSize ) {
		this.driver = driver;

		if ( screenSize === undefined ) {
			this.screenSize = driverManager.currentScreenSize();
		} else {
			driverManager.resizeBrowser( driver, screenSize );
			this.screenSize = screenSize;
		}
	}

	search( query, culture ) {
		var d = webdriver.promise.defer();
		var driver = this.driver;
		var screenSize = this.screenSize;
		this.GoogleSearchPage = new GoogleSearchPage( driver, { location: 'Berlin', culture: 'de', googleDomain: 'com' } );
		driver.sleep( 1000 );
		driver.takeScreenshot().then( function( data ) {
			// mediaHelper.writeScreenshot( data, culture.toUpperCase() + '_' + screenSize + 'GOOGLE', true );
		} );

		this.GoogleSearchPage.search( query );
		driver.sleep( 2000 );


		this.GoogleSearchPage.clickAd( 'wordpress.com' );

		d.fulfill( true );
		return d.promise;
	}
}
