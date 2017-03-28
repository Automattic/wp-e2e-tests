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

var driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
} );

test.describe( 'https://get.blog Sign Up', function() {
	this.timeout( mochaTimeOut );

	test.it( 'wordpress.com is redirected to the correct url', function() {
		const locale = 'it';
		driver = driverManager.startBrowser( { acceptLanguage: locale } );
		// No culture here implies 'en'
		this.wpHomePage = new WPHomePage( driver, { visit: true } );
		this.wpHomePage.checkURL( locale );
	} );
} );
