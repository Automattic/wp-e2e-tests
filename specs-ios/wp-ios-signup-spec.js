import assert from 'assert';
import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper.js';

import LoginPage from '../lib/pages/ios/login-page-ios.js';
import SignupPage from '../lib/pages/ios/signup-page-ios.js';
import MainPage from '../lib/pages/ios/main-page-ios.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startAppTimeoutMS = config.get( 'startAppTimeoutMS' );

var driver;

test.before( 'Start App', function() {
	this.timeout( startAppTimeoutMS );
	return driverManager.startApp().then( function() {
		driver = global.__BROWSER__;
	} );
} );

test.describe( 'Signup (' + process.env.ORIENTATION + '):', function() {
	this.timeout( mochaTimeOut );
	test.describe( 'Test error conditions:', function() {
		let signupPage, loginPage;
		test.before( 'Restart app', function() {
			return driverManager.resetApp();
		} );

		test.it( 'Open signup page', function() {
			loginPage = new LoginPage( driver );
			loginPage.clickCreateASite();
			signupPage = new SignupPage( driver );
		} );

		test.it( 'Site name too short', function() {
			signupPage.enterAccountDetailsAndSubmit( 'a', 'b', 'c' );
			signupPage.verifyErrorPresent( 'Site address must be at least 4 characters.' );
		} );

		test.it( 'Username too short', function() {
			signupPage.enterAccountDetailsAndSubmit( 'a', 'b', 'c', 'e2e' + ( new Date() ).getTime() );
			signupPage.verifyErrorPresent( 'Username must be fat least 4 characters.' );
		} );

		test.it( 'Invalid e-mail', function() {
			const newUsername = 'e2e' + new Date().getTime().toString();
			signupPage.enterAccountDetailsAndSubmit( 'a', newUsername, 'c' );
			signupPage.verifyErrorPresent( 'Invalid email input' );
		} );

		test.it( 'Insecure password', function() {
			const signupInboxId = config.get( 'signupInboxId' );
			const newUsername = 'e2e' + new Date().getTime().toString();
			const newSignupEmailAddress = dataHelper.getEmailAddress( newUsername, signupInboxId );

			signupPage.enterAccountDetailsAndSubmit( newSignupEmailAddress, newUsername, 'c' );
			signupPage.verifyErrorPresent( 'Sorry, that password does not meet our security guidelines. Please choose a password with a mix of uppercase letters, lowercase letters, numbers and symbols.' );
		} );

		test.it( 'Site name already exists', function() {
			signupPage.enterAccountDetailsAndSubmit( 'a', 'hd83', 'c' );
			signupPage.verifyErrorPresent( 'Sorry, that site already exists!' );
		} );
	} );

	test.describe( 'Sign up for a free site (.com):', function() {
		let signupPage
		test.before( 'Restart app', function() {
			return driverManager.resetApp();
		} );

		test.it( 'Open signup page', function() {
			let loginPage = new LoginPage( driver );
			loginPage.clickCreateASite();
			signupPage = new SignupPage( driver );
		} );

		test.it( 'Fill in account details', function() {
			const signupInboxId = config.get( 'signupInboxId' );
			const newUsername = 'e2e' + new Date().getTime().toString();
			const newSignupEmailAddress = dataHelper.getEmailAddress( newUsername, signupInboxId );
			const newPassword = config.get( 'passwordForNewTestSignUps' );

			signupPage.enterAccountDetailsAndSubmit( newSignupEmailAddress, newUsername, newPassword );
		} );

		test.it( 'Can see logged in view after logging in', function() {
			let mainPage = new MainPage( driver );
			mainPage.displayed().then( function( displayed ) {
				assert.equal( displayed, true, 'The main page is not displayed after log in' );
			} );
		} );
	} );
} );
