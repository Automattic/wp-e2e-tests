import test from 'selenium-webdriver/testing';
import config from 'config';
import assert from 'assert';

import * as driverManager from '../lib/driver-manager';
import * as dataHelper from '../lib/data-helper';

import BluehostLoginPage from '../lib/pages/bluehost/bluehost-login-page';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );

var driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( 'Can step through JPO flow on Bluehost', function() {
	this.timeout( mochaTimeOut );
	test.before( function() {
		this.timeout( startBrowserTimeoutMS );
		driver = driverManager.startBrowser();
		return driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	test.describe( 'Provision Bluehost site', function() {
		console.log( driver );
		this.bailSuite( true ); // What does this do?

		// this.bluehostLogin = new BluehostLoginPage( driver );
		// return this.bluehostLogin.logon();
	} );
} );
