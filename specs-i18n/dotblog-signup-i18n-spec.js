import test from 'selenium-webdriver/testing';
import config from 'config';

import * as driverManager from '../lib/driver-manager.js';

import SignUpFlow from '../lib/flows/signup-flow.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );

const testLocale = process.env.LOCALE_TEST || 'en';

var driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.xdescribe( 'https://get.blog Sign Up', function() {
	this.timeout( mochaTimeOut );

	test.beforeEach( function() {
		driver.manage().deleteAllCookies();
		driverManager.deleteLocalStorage( driver );
	} );

	test.it( `Can Get a Dot Blog Desktop (${ testLocale })`, function() {
		const signupFlow = new SignUpFlow( driver, 'desktop' );
		signupFlow.createGetDotBlogWithScreenshots( testLocale );
	} );

	test.it( `Can Get a Dot Blog Tablet (${ testLocale })`, function() {
		const signupFlow = new SignUpFlow( driver, 'tablet' );
		signupFlow.createGetDotBlogWithScreenshots( testLocale );
	} );

	test.it( `Can Get a Dot Blog Mobile (${ testLocale })`, function() {
		const signupFlow = new SignUpFlow( driver, 'mobile' );
		signupFlow.createGetDotBlogWithScreenshots( testLocale );
	} );
} );
