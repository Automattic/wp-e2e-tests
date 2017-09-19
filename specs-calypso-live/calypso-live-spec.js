import assert from 'assert';
import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper';

import LoginPage from '../lib/pages/login-page';
import ReaderPage from '../lib/pages/reader-page';
import CalypsoLiveBranchesStatusPage from '../lib/pages/calypso-live/calypso-live-branches-status-page';

import LoginFlow from '../lib/flows/login-flow.js';

const mochaTimeOutMs = 600000; // 10 mins
const liveBranchActiveTimeOutMS = 60000; // 1 min
const liveBranchReadyTimeOutMS = 360000; // 6 mins
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();
const branchName = config.get( 'branchName' );

let driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	if ( ( config.has( 'liveBranch' ) === false ) || config.get( 'liveBranch' ) === false ) {
		assert.fail( 'Trying to run live branch spec when \'liveBranch\' is not set' );
	}
	driver = driverManager.startBrowser();
} );

test.describe( `[${host}] Calypso.Live: (${screenSize}) @parallel`, function() {
	this.timeout( mochaTimeOutMs );
	this.bailSuite( true );

	test.describe( 'Waiting for a live branch to be ready :', function() {
		test.before( function() {
			driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.describe( 'Waiting and visiting', function() {
			test.it( 'Load the live branch by visiting the login page for that live branch - this will make sure it\'s loaded', function() {
				const liveBranchLoginURL = LoginPage.getLoginURL();
				return driver.get( liveBranchLoginURL ); // This will either be the calypso.live loading page or the actual logon page
			} );

			test.it( 'Load the calypso.live status page and make sure branch is not in \'Error\' list', function() {
				const calypsoLiveBranchesStatusPage = new CalypsoLiveBranchesStatusPage( driver, { visit: true } );
				return calypsoLiveBranchesStatusPage.branchHasError( branchName ).then( ( hasError ) => {
					assert.equal( hasError, false, `Branch '${ branchName }' has an error in Calypso live!` );
				} );
			} );

			test.it( 'Wait until the branch is showing as \'active\'', function() {
				const calypsoLiveBranchesStatusPage = new CalypsoLiveBranchesStatusPage( driver, { visit: true } );
				return calypsoLiveBranchesStatusPage.waitUntilBranchIsStatus( branchName, 'active', liveBranchActiveTimeOutMS );
			} );

			test.it( 'Wait until the branch is showing as \'ready\'', function() {
				const calypsoLiveBranchesStatusPage = new CalypsoLiveBranchesStatusPage( driver, { visit: true } );
				return calypsoLiveBranchesStatusPage.waitUntilBranchIsStatus( branchName, 'ready', liveBranchReadyTimeOutMS );
			} );

			test.it( 'Load the calypso.live status page and make sure branch is still not in \'Error\' list', function() {
				const calypsoLiveBranchesStatusPage = new CalypsoLiveBranchesStatusPage( driver, { visit: true } );
				return calypsoLiveBranchesStatusPage.branchHasError( branchName ).then( ( hasError ) => {
					assert.equal( hasError, false, `Branch '${ branchName }' has an error in Calypso live!` );
				} );
			} );

			test.describe( 'Can Log In', function() {
				test.it( 'Can log in', function() {
					let loginFlow = new LoginFlow( driver );
					loginFlow.login();
				} );

				test.it( 'Can see Reader Page after logging in', function() {
					let readerPage = new ReaderPage( driver );
					readerPage.displayed().then( function( displayed ) {
						assert.equal( displayed, true, 'The reader page is not displayed after log in' );
					} );
				} );
			} );
		} );
	} );
} );
