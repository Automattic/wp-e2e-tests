import test from 'selenium-webdriver/testing';
import config from 'config';
import * as driverManager from '../lib/driver-manager.js';
import * as eyesHelper from '../lib/eyes-helper.js';

import LoginFlow from '../lib/flows/login-flow.js';

import DevdocsPage from '../lib/pages/devdocs-page.js';

import webdriver from 'selenium-webdriver';
const by = webdriver.By;

let mochaDevDocsTimeOut = config.get( 'mochaDevDocsTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );

let driver, screenSizeName;
screenSizeName = driverManager.currentScreenSize();

let eyes = eyesHelper.eyesSetup( true );

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser( { useCustomUA: false } );
} );

test.describe( `DevDocs Visual Diff (${screenSizeName})`, function() {
	var devdocsPage;
	this.timeout( mochaDevDocsTimeOut );

	test.before( function() {
		let testName = `DevDocs [${global.browserName}] [${screenSizeName}]`;
		let testEnvironment = 'WordPress.com';

		eyesHelper.eyesOpen( driver, eyes, testEnvironment, testName );

		let loginFlow = new LoginFlow( driver, 'visualUser' );
		loginFlow.login();

		devdocsPage = new DevdocsPage( driver, true );
		return devdocsPage.displayed();
	} );

	test.it( 'Verify UI Components', function() {
		this.timeout( mochaDevDocsTimeOut * 2 );
		devdocsPage.openUIComponents().then( function() {
			devdocsPage.screenshotAllElements( eyes );
		} );
	} );

	test.it( 'Verify Typography', function() {
		devdocsPage.openTypography().then( function() {
			devdocsPage.hideMasterbar().then( function() {
				devdocsPage.hideEnvironmentBadge().then( function() {
					eyesHelper.eyesScreenshot( driver, eyes, 'DevDocs Design (Typography)', by.id( 'primary' ) );
				} );
			} );
		} );
	} );

	test.it( 'Verify Blocks Page', function() {
		this.timeout( mochaDevDocsTimeOut * 2 );
		devdocsPage.openAppComponents().then( function() {
			devdocsPage.screenshotAllElements( eyes );
		} );
	} );

	test.after( function() {
		eyesHelper.eyesClose( eyes );
	} );
} );

test.after( function() {
	if ( ! process.env.EYESDEBUG ) {
		eyes.abortIfNotClosed();
	}
} );
