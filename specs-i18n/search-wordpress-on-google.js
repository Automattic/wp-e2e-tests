import test from 'selenium-webdriver/testing';
import config from 'config';

import * as driverManager from '../lib/driver-manager.js';

import GoogleFlow from '../lib/flows/google-flow.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );

const culture = process.env.CULTURE || 'en';
const location = process.env.LOCATION || 'New York City';

var driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( 'Search for WordPress on Google', function() {
	this.timeout( mochaTimeOut );

	test.beforeEach( function() {
		driver.manage().deleteAllCookies();
		driverManager.deleteLocalStorage( driver );
	} );

	test.it( `Can load Google`, function() {
		const googleFlow = new GoogleFlow( driver, 'desktop' );
		googleFlow.search( 'wordpress', { location, culture, googleDomain: 'com' }  );
	} );
} );
