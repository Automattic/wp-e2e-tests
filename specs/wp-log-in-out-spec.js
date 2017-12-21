import assert from 'assert';
import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper';

import EmailClient from '../lib/email-client.js';
import ReaderPage from '../lib/pages/reader-page';
import ProfilePage from '../lib/pages/profile-page';
import WPHomePage from '../lib/pages/wp-home-page';
import MagicLoginPage from '../lib/pages/magic-login-page';

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

		let passwordlessUser;
		if ( passwordlessUser = config.get( 'testAccounts' )[ 'passwordlessUser' ] ) {
			test.describe.only( 'Can Log in without a password', function() {
				test.describe( 'Can enter the passwordless flow by entering the email of an account which does not have a password defined', function() {
					let magicLoginLink;
					test.before( function () {
						this.emailClient = new EmailClient( config.get( 'passwordlessInboxId' ) );
						let loginFlow = new LoginFlow( driver, 'passwordlessUser' );
						return loginFlow.login();
					} );

					test.it( 'Visit the magic link to log in', function() {
						return this.emailClient.getNewEmailsByRecipient( passwordlessUser[0] ).then( function( emails ) {
							assert.equal( emails.length, 1, 'The number of magic link emails is not equal to 1' );
							magicLoginLink = emails[0].html.links[0].href;
							assert( magicLoginLink !== undefined, 'Could not locate the magic login link email link' );
						} );
					} );

					test.describe( 'Can use the magic link to log in', function() {
						test.it( 'Visit the magic link and we\'re logged in', function() {
							driver.get( magicLoginLink );
							this.magicLoginPage = new MagicLoginPage( driver );
							this.magicLoginPage.finishLogin();
							let readerPage = new ReaderPage( driver );
							return readerPage.displayed().then( function( displayed ) {
								return assert.equal( displayed, true, 'The reader page is not displayed after log in' );
							} );
						} );
					} );
				} );
			} );
		}

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
