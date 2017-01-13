import assert from 'assert';
import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager.js';

import LoginFlow from '../lib/flows/login-flow-mobile.js';
import LoginPage from '../lib/pages/ios/login-page-ios.js';
import MainPage from '../lib/pages/ios/main-page-ios.js';
import SiteDetailsPage from '../lib/pages/ios/site-details-page-ios.js';
import ProfilePage from '../lib/pages/ios/profile-page-ios.js';
import SettingsPage from '../lib/pages/ios/settings-page-ios.js';
import NavbarComponent from '../lib/components/ios/navbar-component-ios.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startAppTimeoutMS = config.get( 'startAppTimeoutMS' );

var driver;

test.before( 'Start App', function() {
	this.timeout( startAppTimeoutMS );
	return driverManager.startApp().then( function() {
		driver = global.__BROWSER__;
	} );
} );

//TODO - Add tests for landscape orientation, handle it in here rather than in the wrapper via envvar

test.describe( 'Authentication (' + process.env.ORIENTATION + '):', function() {
	this.timeout( mochaTimeOut );
	test.describe( 'Logging In and Out (.com):', function() {
		test.before( 'Restart app', function() {
			return driverManager.resetApp();
		} );

		test.describe( 'Can Log In', function() {
			test.it( 'Can log in', function() {
				let loginFlow = new LoginFlow( driver );
				return loginFlow.login();
			} );

			test.it( 'Can see logged in view after logging in', function() {
				let mainPage = new MainPage( driver );
				return mainPage.displayed().then( function( displayed ) {
					assert.equal( displayed, true, 'The main page is not displayed after log in' );
				} );
			} );
		} );

		test.describe( 'Can Log Out', function() {
			let profilePage;

			test.it( 'Can view profile to log out', function() {
				let navbarComponent = new NavbarComponent( driver );
				navbarComponent.openTab( 'Me' );
				profilePage = new ProfilePage( driver );
			} );

			//TODO: This is marking as successful even if it can't find the button to log out
			test.it( 'Can logout from profile page', function() {
				profilePage.disconnectFromWPCom();
			} );

			test.it( 'Can see login page after logging out', function() {
				let loginPage = new LoginPage( driver );
				loginPage.displayed().then( function( displayed ) {
					assert.equal( displayed, true, 'The login page is not displayed after logging out' );
				} );
			} );
		} );
	} );

	test.describe( 'Logging In and Out (.org):', function() {
		test.before( 'Restart app', function() {
			return driverManager.resetApp();
		} );

		test.describe( 'Can Log In', function() {
			test.it( 'Can log in', function() {
				const selfHostedURL = config.get( 'selfHostedURL' );

				let loginFlow = new LoginFlow( driver, 'selfHostedUser', { selfHostedURL: selfHostedURL } );
				return loginFlow.login();
			} );

			test.it( 'Can see logged in view after logging in', function() {
				let mainPage = new MainPage( driver );
				mainPage.displayed().then( function( displayed ) {
					assert.equal( displayed, true, 'The main page is not displayed after log in' );
				} );
			} );
		} );

		test.describe( 'Can Log Out', function() {
			let mainPage;

			test.it( 'Can open My Sites tab', function() {
				let navbarComponent = new NavbarComponent( driver );
				navbarComponent.openTab( 'My Sites' );
				mainPage = new MainPage( driver );
			} );

			test.it( 'Can select .org site page', function() {
				const selfHostedURL = config.get( 'selfHostedURL' );

				mainPage.clickDotOrgSite( selfHostedURL );
			} );

			test.it( 'Can open Settings', function() {
				let siteDetailsPage = new SiteDetailsPage( driver );
				siteDetailsPage.clickMenuItem( 'Settings' );
			} );

			test.it( 'Can logout from settings page', function() {
				let settingsPage = new SettingsPage( driver );
				settingsPage.removeSite();
			} );

			test.it( 'Can see login page after logging out', function() {
				let loginPage = new LoginPage( driver );
				loginPage.displayed().then( function( displayed ) {
					assert.equal( displayed, true, 'The login page is not displayed after logging out' );
				} );
			} );
		} );
	} );
} );
