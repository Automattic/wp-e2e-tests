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

test.describe( 'wordpress.com is redirected to the correct url for he', function() {
	this.timeout( mochaTimeOut );

	test.it( 'should redirect to the correct url for he.wordpress.com', function() {
		driver = driverManager.startBrowser( { acceptLanguage: 'he' } );

		// No culture here implies 'en'
		this.wpHomePage = new WPHomePage( driver, { visit: true } );
		this.wpHomePage.checkURL( 'he' );
	} );
} );
