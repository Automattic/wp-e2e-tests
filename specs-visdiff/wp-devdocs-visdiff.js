import test from 'selenium-webdriver/testing';
import assert from 'assert';
import config from 'config';
import * as driverManager from '../lib/driver-manager.js';
import * as driverHelper from '../lib/driver-helper.js';
import * as slackNotifier from '../lib/slack-notifier';

import LoginFlow from '../lib/flows/login-flow.js';

import DevdocsPage from '../lib/pages/devdocs-page.js';

import webdriver from 'selenium-webdriver';
const by = webdriver.By;

let mochaDevDocsTimeOut = config.get( 'mochaDevDocsTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );

let driver, screenSize, screenSizeName;
screenSizeName = driverManager.currentScreenSize();

let Eyes = require( 'eyes.selenium' ).Eyes;
let eyes = new Eyes();
eyes.setApiKey( config.get( 'eyesKey' ) );
eyes.setForceFullPageScreenshot( true );

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser( { useCustomUA: false } );
	screenSize = driverManager.getSizeAsObject();
} );

test.describe( `DevDocs Visual Diff (${screenSizeName})`, function() {
	var devdocsPage;
	this.timeout( mochaDevDocsTimeOut );

	test.before( function() {
		let testName = `DevDocs [${global.browserName}] [${screenSizeName}]`;

		let batchName = '';
		if ( process.env.CIRCLE_BUILD_NUM ) {
			batchName = `wp-e2e-tests-visdiff [${global.browserName}] #${process.env.CIRCLE_BUILD_NUM}`
		}

		if ( batchName !== '' ) {
			eyes.setBatch( batchName, `wp-e2e-tests-visdiff-${global.browserName}-${process.env.CIRCLE_BUILD_NUM}` );
		}

		eyes.open( driver, 'WordPress.com', testName, screenSize );
		let loginFlow = new LoginFlow( driver );
		loginFlow.login();

		devdocsPage = new DevdocsPage( driver, true );
		return devdocsPage.displayed();
	} );

	test.xit( 'Verify UI Components', function() {
		this.timeout( mochaDevDocsTimeOut * 2 );
		devdocsPage.openUIComponents().then( function() {
			devdocsPage.screenshotAllElements( eyes );
		} );
	} );

	test.xit( 'Verify Typography', function() {
		devdocsPage.openTypography().then( function() {
			devdocsPage.hideMasterbar().then( function() {
				devdocsPage.hideEnvironmentBadge().then( function() {
					driverHelper.eyesScreenshot( driver, eyes, 'DevDocs Design (Typography)', by.id( 'primary' ) );
				} );
			} );
		} );
	} );

	test.it( 'Verify Blocks Page', function() {
		devdocsPage.openAppComponents().then( function() {
			devdocsPage.screenshotAllElements( eyes );
		} );
	} );

	test.after( function() {
		try {
			eyes.close( false ).then( function( testResults ) {
				let message = '';

				if ( testResults.mismatches ) {
					message = `<!here> Visual diff failed with ${testResults.mismatches} mismatches - ${testResults.appUrls.session}`;
				} else if ( testResults.missing ) {
					message = `<!here> Visual diff failed with ${testResults.missing} missing steps out of ${testResults.steps} - ${testResults.appUrls.session}`;
				} else if ( testResults.isNew ) {
					message = `<!here> Visual diff marked as failed because it is a new baseline - ${testResults.appUrls.session}`;
				}

				if ( message !== '' ) {
					slackNotifier.warn( message );
					if ( config.has( 'failVisdiffs' ) && config.get( 'failVisdiffs' ) ) {
						assert( false, message );
					}
				}
			} );
		} finally {
			eyes.abortIfNotClosed();
		}
	} );
} );

test.after( function() {
	eyes.abortIfNotClosed();
} );
