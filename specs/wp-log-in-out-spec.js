import assert from 'assert';
import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper';

import ReaderPage from '../lib/pages/reader-page';
import ProfilePage from '../lib/pages/profile-page';
import WPHomePage from '../lib/pages/wp-home-page';

import NavbarComponent from '../lib/components/navbar-component.js';

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

test.describe( `[${host}] Authentication: (${screenSize}) @parallel`, function() {
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
				driver.getCurrentUrl().then( function( url ) {
					if ( url.endsWith( '/?apppromo' ) ) {
						url = url.replace( '/?apppromo', '' );
					}
					assert.equal( url, 'https://wordpress.com', 'The home page url was incorrect after signing out' );
				} );
			} );
		} );
	} );
} );

test.describe( `[${host}] User Agent: (${screenSize}) @parallel`, function() {
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
