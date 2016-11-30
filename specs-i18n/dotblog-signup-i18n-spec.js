import test from 'selenium-webdriver/testing';
import config from 'config';

import * as driverManager from '../lib/driver-manager.js';

import SignUpFlow from '../lib/flows/signup-flow.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );

const culture = process.env.CULTURE || 'en';

var driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( 'https://get.blog Sign Up', function() {
	this.timeout( mochaTimeOut );

	test.beforeEach( function() {
		driver.manage().deleteAllCookies();
		driverManager.deleteLocalStorage( driver );
	} );

	test.it( `Can Get a Dot Blog (${culture}) Desktop`, function() {
		const signupFlow = new SignUpFlow( driver, 'desktop' );
		signupFlow.createGetDotBlogWithScreenshots( culture );
	} );

	test.it( `Can Get a Dot Blog (${culture}) Tablet`, function() {
		const signupFlow = new SignUpFlow( driver, 'tablet' );
		signupFlow.createGetDotBlogWithScreenshots( culture );
	} );

	test.it( `Can Get a Dot Blog (${culture}) Mobile`, function() {
		const signupFlow = new SignUpFlow( driver, 'mobile' );
		signupFlow.createGetDotBlogWithScreenshots( culture );
	} );
} );
