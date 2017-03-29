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

test.describe( 'wordpress.com is redirected to the correct url for it', function() {
	this.timeout( mochaTimeOut );

	test.it( 'should redirect to the correct url for it.wordpress.com', function() {
		driver = driverManager.startBrowser( { acceptLanguage: 'it' } );

		// No culture here implies 'en'
		this.wpHomePage = new WPHomePage( driver, { visit: true } );
		this.wpHomePage.checkURL( 'it' );
	} );
} );
