/**
 * External Dependencies
 */
import test from 'selenium-webdriver/testing';
import config from 'config';

/**
 * Internal Dependencies
 */
import * as driverManager from '../lib/driver-manager.js';

import WPHomePage from '../lib/pages/wp-home-page';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );

// call run.sh with -I to feed in the mag16
const locale = driverManager.currentLocale();

var driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
} );

test.describe( `Logged out homepage redirect test @i18n (${ locale })`, function() {
	this.timeout( mochaTimeOut );

	test.it( `should redirect to the correct url for wordpress.com (${ locale })`, function() {
		driver = driverManager.startBrowser();

		// No culture here implies 'en'
		this.wpHomePage = new WPHomePage( driver, { visit: true } );
		this.wpHomePage.checkURL( locale );
	} );
} );
