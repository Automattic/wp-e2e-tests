import assert from 'assert';
import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper';

import ReaderPage from '../lib/pages/reader-page';
import ProfilePage from '../lib/pages/profile-page';
import WPHomePage from '../lib/pages/wp-home-page';

import NavbarComponent from '../lib/components/navbar-component.js';
import LoggedOutMasterbarComponent from '../lib/components/logged-out-masterbar-component'

import LoginFlow from '../lib/flows/login-flow.js';

const mochaTimeOutMs = 600000; // 10 mins
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
			test.it( 'Can use the status page to wait ', function() {
				let loginFlow = new LoginFlow( driver );
				loginFlow.login();
			} );

			// test.it( 'Can see the logged out start page for live branch when it is ready', function() {
			// 	let readerPage = new ReaderPage( driver );
			// 	readerPage.displayed().then( function( displayed ) {
			// 		assert.equal( displayed, true, 'The reader page is not displayed after log in' );
			// 	} );
			// } );
		} );

		// test.describe( 'Can Log Out', function() {
		// 	test.it( 'Can view profile to log out', function() {
		// 		let navbarComponent = new NavbarComponent( driver );
		// 		navbarComponent.clickProfileLink();
		// 	} );
        //
		// 	test.it( 'Can logout from profile page', function() {
		// 		let profilePage = new ProfilePage( driver );
		// 		profilePage.clickSignOut();
		// 	} );
        //
		// 	test.it( 'Can see wordpress.com home when after logging out', function() {
		// 		const loggedOutMasterbarComponent = new LoggedOutMasterbarComponent( driver );
		// 		loggedOutMasterbarComponent.displayed().then( ( displayed ) => {
		// 			assert( displayed, 'The logged out masterbar isn\'t displayed after logging out' );
		// 		} );
		// 	} );
		// } );
	} );
} );
