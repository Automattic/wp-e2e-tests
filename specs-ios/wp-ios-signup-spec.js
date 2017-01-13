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

	const signupInboxId = config.get( 'signupInboxId' );
	const username = 'e2e' + new Date().getTime().toString();
	const emailAddress = dataHelper.getEmailAddress( username, signupInboxId );
	const password = config.get( 'passwordForNewTestSignUps' );

	test.describe( 'Test error conditions:', function() {
		let signupPage, loginPage;
		test.before( 'Restart app', function() {
			return driverManager.resetApp().then( () => {
				loginPage = new LoginPage( driver );
				return loginPage.clickCreateASite().then( () => {
					signupPage = new SignupPage( driver );
				} );
			} );
		} );

		test.it( 'Site name too short', function() {
			const expectedError = 'Site address must be at least 4 characters.';

			return signupPage.enterAccountDetailsAndSubmit( emailAddress, username, password, 'a' ).then( () => {
				return signupPage.getErrorMessage().then( ( displayedError ) => {
					assert.equal( displayedError, expectedError );
				} );
			} ).finally( () => {
				return signupPage.acknowledgeError();
			} );
		} );

		test.it( 'Username too short', function() {
			const expectedError = 'Username must be at least 4 characters.';

			signupPage.enterAccountDetailsAndSubmit( emailAddress, 'a', password, username ).then( () => {
				return signupPage.getErrorMessage().then( ( displayedError ) => {
					assert.equal( displayedError, expectedError );
				} );
			} ).finally( () => {
				return signupPage.acknowledgeError();
			} );
		} );

		test.it( 'Invalid e-mail', function() {
			const expectedError = 'Please enter a valid email address';

			signupPage.enterAccountDetailsAndSubmit( 'a', username, password, username ).then( () => {
				return signupPage.getErrorMessage().then( ( displayedError ) => {
					assert.equal( displayedError, expectedError );
				} );
			} ).finally( () => {
				return signupPage.acknowledgeError();
			} );
		} );

		test.it( 'Insecure password', function() {
			const expectedError = 'Sorry, that password does not meet our security guidelines. Please choose a password with a minimum length of six characters, mixing uppercase letters, lowercase letters, numbers and symbols.';

			signupPage.enterAccountDetailsAndSubmit( emailAddress, username, 'c', username ).then( () => {
				return signupPage.getErrorMessage().then( ( displayedError ) => {
					assert.equal( displayedError, expectedError );
				} );
			} ).finally( () => {
				return signupPage.acknowledgeError();
			} );
		} );

		test.it( 'E-mail already in use', function() {
			const expectedError = 'Sorry, that email address is already being used!';

			signupPage.enterAccountDetailsAndSubmit( 'a@b.com', username, password, username ).then( () => {
				return signupPage.getErrorMessage().then( ( displayedError ) => {
					assert.equal( displayedError, expectedError );
				} );
			} ).finally( () => {
				return signupPage.acknowledgeError();
			} );
		} );

		test.it( 'Username already exists', function() {
			const expectedError = 'Sorry, that username already exists!';

			signupPage.enterAccountDetailsAndSubmit( emailAddress, 'matt', password, username ).then( () => {
				return signupPage.getErrorMessage().then( ( displayedError ) => {
					assert.equal( displayedError, expectedError );
				} );
			} ).finally( () => {
				return signupPage.acknowledgeError();
			} );
		} );

		test.it( 'Site already exists', function() {
			const expectedError = 'Sorry, that site already exists!';

			signupPage.enterAccountDetailsAndSubmit( emailAddress, username, password, 'matt' ).then( () => {
				return signupPage.getErrorMessage().then( ( displayedError ) => {
					assert.equal( displayedError, expectedError );
				} );
			} ).finally( () => {
				return signupPage.acknowledgeError();
			} );
		} );
	} );

	test.describe( 'Sign up for a free site (.com):', function() {
		let signupPage
		test.before( 'Restart app', function() {
			return driverManager.resetApp().then( () => {
				let loginPage = new LoginPage( driver );
				return loginPage.clickCreateASite().then( () => {
					signupPage = new SignupPage( driver );
				} );
			} );
		} );

		test.it( 'Fill in account details', function() {
			signupPage.enterAccountDetailsAndSubmit( emailAddress, username, password );
		} );

		test.it( 'Can see logged in view after logging in', function() {
			let mainPage = new MainPage( driver );
			mainPage.displayed().then( function( displayed ) {
				assert.equal( displayed, true, 'The main page is not displayed after log in' );
			} );
		} );
	} );
} );
