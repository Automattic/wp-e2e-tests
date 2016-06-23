import test from 'selenium-webdriver/testing';
import config from 'config';
import assert from 'assert';
import { By as by } from 'selenium-webdriver';

import * as driverManager from '../lib/driver-manager.js';

import LoginFlow from '../lib/flows/login-flow.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

var driver;

test.before( 'Start Browser', function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( 'Guided Tours: (' + screenSize + ')', function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.describe( 'Forcing a tour:', function() {
		test.before( 'Delete Cookies and Login', function() {
			driverManager.clearCookiesAndDeleteLocalStorage( driver );
			let loginFlow = new LoginFlow( driver );
			loginFlow.login();
			driver.getCurrentUrl().then( ( url ) => driver.get( url + '?tour=main' ) );
		} );

		test.it( 'Shows the initial step', function( done ) {
			const step = by.className( 'guided-tours__step-first' );
			driver.isElementPresent( step ).then( ( present ) => {
				assert( present, true );
				done();
			} );
		} );
	} );
} );
