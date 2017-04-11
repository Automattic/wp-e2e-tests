import assert from 'assert';
import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager';

import StatsPage from '../lib/pages/stats-page';

import LoginFlow from '../lib/flows/login-flow';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

let driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `WooCommerce on Calypso: '${ screenSize }'`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.before( function() {
		driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	test.it( 'Can see stats page for a WooCommerce site', function() {
		let loginFlow = new LoginFlow( driver, 'wooCommerceUser' );
		loginFlow.loginAndSelectMySite();
		this.statsPage = new StatsPage( driver );
	} );
} );
