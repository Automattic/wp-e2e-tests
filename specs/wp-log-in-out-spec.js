import assert from 'assert';
import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper';

import ReaderPage from '../lib/pages/reader-page';
import ProfilePage from '../lib/pages/profile-page';
import WPHomePage from '../lib/pages/wp-home-page';
import DevDocsNoticesPage from '../lib/pages/devdocs/devdocs-notices-page';

import NavbarComponent from '../lib/components/navbar-component.js';
import LoggedOutMasterbarComponent from '../lib/components/logged-out-masterbar-component'

import LoginFlow from '../lib/flows/login-flow.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

var driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `[${host}] Authentication: (${screenSize}) @parallel @jetpack`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.describe( 'Logging In and Out:', function() {
		test.before( function() {
			driverManager.clearCookiesAndDeleteLocalStorage( driver );
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

		// Test Jetpack SSO
		if ( host !== 'WPCOM' ) {
			test.describe( 'Can Log via Jetpack SSO', function() {
				test.it( 'Can log into site via Jetpack SSO', () => {
					let loginFlow = new LoginFlow( driver );
					return loginFlow.login( { jetpackSSO: true } );
				} );

				test.it( 'Can return to Reader', () => {
					let readerPage = new ReaderPage( driver, true );
					return readerPage.displayed();
				} );
			} );
		}

		test.describe( 'Can Log Out', function() {
			test.it( 'Can view profile to log out', function() {
				let navbarComponent = new NavbarComponent( driver );
				navbarComponent.clickProfileLink();
			} );

			test.it( 'Can logout from profile page', function() {
				let profilePage = new ProfilePage( driver );
				profilePage.clickSignOut();
			} );

			test.it( 'Can see wordpress.com home when after logging out', function() {
				const loggedOutMasterbarComponent = new LoggedOutMasterbarComponent( driver );
				loggedOutMasterbarComponent.displayed().then( ( displayed ) => {
					assert( displayed, 'The logged out masterbar isn\'t displayed after logging out' );
				} );
			} );
		} );
	} );
} );

test.describe( `[${host}] User Agent: (${screenSize}) @parallel @jetpack`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.before( function() {
		driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	test.it( 'Can see the correct user agent set', function() {
		this.wpHomePage = new WPHomePage( driver, { visit: true } );
		driver.executeScript( 'return navigator.userAgent;' ).then( ( userAgent ) => {
			assert( userAgent.match( 'wp-e2e-tests' ), `User Agent does not contain 'wp-e2e-tests'.  [${userAgent}]` );
		} );
	} );
} );

test.describe( `[${host}] Can check for errors and warnings on every page: (${screenSize}) @parallel`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.before( function() {
		driverManager.clearCookiesAndDeleteLocalStorage( driver );
		const loginFlow = new LoginFlow( driver );
		return loginFlow.login();
	} );

	test.it( 'Login and check dev docs for error message', function() {
		const devDocsNoticesPage = new DevDocsNoticesPage( driver, true );
		return devDocsNoticesPage.checkForGlobalErrors( { reportErrors: false } );
	} );

	test.it( 'Login and check dev docs for warning message', function() {
		const devDocsNoticesPage = new DevDocsNoticesPage( driver, true );
		return devDocsNoticesPage.checkForGlobalWarnings( { reportWarnings: false } );
	} );
} );
