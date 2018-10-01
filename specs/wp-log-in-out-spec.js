/** @format */

import assert from 'assert';
// import { get } from 'lodash';
// import speakeasy from 'speakeasy';

import config from 'config';
import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper';

// import EmailClient from '../lib/email-client.js';
// import { listenForSMS } from '../lib/xmpp-client';
// import { subscribeToPush, approvePushToken } from '../lib/push-client';
import ReaderPage from '../lib/pages/reader-page';
import ProfilePage from '../lib/pages/profile-page';
import WPHomePage from '../lib/pages/wp-home-page';
// import MagicLoginPage from '../lib/pages/magic-login-page';
// import LoginPage from '../lib/pages/login-page';

import NavBarComponent from '../lib/components/nav-bar-component.js';
import LoggedOutMasterbarComponent from '../lib/components/logged-out-masterbar-component';

import LoginFlow from '../lib/flows/login-flow';
import LoginPage from '../lib/pages/login-page';
import WPAdminLogonPage from '../lib/pages/wp-admin/wp-admin-logon-page.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;

before( async function() {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] Auth Screen Canary: (${ screenSize }) @parallel @safaricanary`, function() {
	this.timeout( mochaTimeOut );

	describe( 'Loading the log-in screen', function() {
		before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'Can see the log in screen', async function() {
			await LoginPage.Visit( driver, LoginPage.getLoginURL() );
		} );
	} );
} );

describe( `[${ host }] Authentication: (${ screenSize }) @parallel @jetpack`, function() {
	this.timeout( mochaTimeOut );

	describe( 'Logging In and Out:', function() {
		before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		describe( 'Can Log In', function() {
			step( 'Can log in', async function() {
				let loginFlow = new LoginFlow( driver );
				await loginFlow.login();
			} );

			step( 'Can see Reader Page after logging in', async function() {
				return await ReaderPage.Expect( driver );
			} );
		} );

		// Test Jetpack SSO
		if ( host !== 'WPCOM' ) {
			describe( 'Can Log via Jetpack SSO', function() {
				step( 'Can log into site via Jetpack SSO', async function() {
					// let loginFlow = new LoginFlow( driver );
					// return await loginFlow.login( { jetpackSSO: true } );
					const loginPage = await WPAdminLogonPage.Visit( driver, dataHelper.getJetpackSiteName() );
					return await loginPage.logonSSO();
				} );

				step( 'Can return to Reader', async function() {
					return await ReaderPage.Visit( driver );
				} );
			} );
		}

		describe( 'Can Log Out', function() {
			step( 'Can view profile to log out', async function() {
				let navbarComponent = await NavBarComponent.Expect( driver );
				await navbarComponent.clickProfileLink();
			} );

			step( 'Can logout from profile page', async function() {
				const profilePage = await ProfilePage.Expect( driver );
				await profilePage.clickSignOut();
			} );

			step( 'Can see wordpress.com home when after logging out', async function() {
				return await LoggedOutMasterbarComponent.Expect( driver );
			} );
		} );
	} );

	// if ( dataHelper.hasAccountWithFeatures( '+2fa-sms -passwordless' ) && !dataHelper.isRunningOnLiveBranch() ) {
	// 	describe( 'Can Log in on a 2fa account', function() {
	// 		let loginFlow, twoFALoginPage, twoFACode;
	// 		before( function( done ) {
	// 			driverManager.clearCookiesAndDeleteLocalStorage( driver ).then( function() {
	// 				loginFlow = new LoginFlow( driver, [ '+2fa-sms', '-passwordless' ] );
	// 				// make sure we listen for SMS before we trigger any
	// 				const xmppClient = listenForSMS( loginFlow.account );
	// 				xmppClient.once( 'e2e:ready', () => {
	// 					// send sms now!
	// 					loginFlow.login();
	// 					twoFALoginPage = new LoginPage( driver );
	// 					twoFALoginPage.use2FAMethod( 'sms' );
	// 				} );
	// 				xmppClient.on( 'e2e:sms', sms => {
	// 					const twoFACodeMatches = sms.body.match( /^\d+/ );
	// 					twoFACode = twoFACodeMatches && twoFACodeMatches[0];
	// 					if ( twoFACode ) {
	// 						xmppClient.stop().then( () => done() );
	// 					}
	// 				} );
	// 			} );
	// 		} );
	//
	// 		step( 'Should be on the /log-in/sms page', function() {
	// 			return twoFALoginPage.displayed().then( function() {
	// 				return driver.getCurrentUrl().then( ( urlDisplayed ) => {
	// 					assert( urlDisplayed.indexOf( '/log-in/sms' ) !== -1, 'The 2fa sms page is not displayed after log in' );
	// 				} );
	// 			} );
	// 		} );
	//
	// 		step( 'Enter the 2fa code and we\'re logged in', function() {
	// 			return twoFALoginPage.enter2FACode( twoFACode );
	// 		} );
	// 	} );
	// }
	//
	// if ( dataHelper.hasAccountWithFeatures( '+2fa-push -passwordless' ) && !dataHelper.isRunningOnLiveBranch() ) {
	// 	describe( 'Can Log in on with 2fa push account', function() {
	// 		let loginFlow, twoFALoginPage;
	// 		before( function( done ) {
	// 			driverManager.clearCookiesAndDeleteLocalStorage( driver ).then( () => {
	// 				loginFlow = new LoginFlow( driver, [ '+2fa-push', '-passwordless' ] );
	// 				loginFlow.login();
	// 				twoFALoginPage = new LoginPage( driver );
	// 				done();
	// 			} );
	// 		} );
	//
	// 		step( 'Should be on the /log-in/push page', function() {
	// 			return twoFALoginPage.displayed().then( function() {
	// 				return driver.getCurrentUrl().then( ( urlDisplayed ) => {
	// 					assert( urlDisplayed.indexOf( '/log-in/push' ) !== -1, 'The 2fa push page is not displayed after log in' );
	// 				} );
	// 			} );
	// 		} );
	//
	// 		step( 'Approve push 2fa token and we\'re logged in', function( done ) {
	// 			subscribeToPush( loginFlow.account.pushConfig, pushToken => {
	// 				approvePushToken( pushToken, loginFlow.account.bearerToken ).then( () => {
	// 					const readerPage = new ReaderPage( driver );
	// 					readerPage.displayed().then( displayed => {
	// 						assert.strictEqual( displayed, true, 'The reader page is not displayed after log in' );
	// 						done();
	// 					} );
	// 				} );
	// 			} );
	// 		} );
	// 	} );
	// }
	//
	// if ( dataHelper.hasAccountWithFeatures( '+2fa-otp -passwordless' ) && !dataHelper.isRunningOnLiveBranch() ) {
	// 	describe( 'Can Log in on a 2fa account', function() {
	// 		let loginFlow, twoFALoginPage;
	// 		before( function() {
	// 			return driverManager.clearCookiesAndDeleteLocalStorage( driver ).then( function() {
	// 				loginFlow = new LoginFlow( driver, [ '+2fa-otp', '-passwordless' ] );
	// 				loginFlow.login();
	// 				twoFALoginPage = new LoginPage( driver );
	// 				return twoFALoginPage.use2FAMethod( 'otp' );
	// 			} );
	// 		} );
	//
	// 		step( 'Should be on the /log-in/authenticator page', function() {
	// 			return twoFALoginPage.displayed().then( function() {
	// 				return driver.getCurrentUrl().then( ( urlDisplayed ) => {
	// 					assert( urlDisplayed.indexOf( '/log-in/authenticator' ) !== -1, 'The 2fa authenticator page is not displayed after log in' );
	// 				} );
	// 			} );
	// 		} );
	//
	// 		step( 'Enter the 2fa code and we\'re logged in', function() {
	// 			const twoFACode = speakeasy.totp( {
	// 				secret: loginFlow.account['2faOTPsecret'],
	// 				encoding: 'base32'
	// 			} );
	// 			return twoFALoginPage.enter2FACode( twoFACode );
	// 		} );
	// 	} );
	// }
	//
	// if ( dataHelper.hasAccountWithFeatures( '+passwordless -2fa' ) && !dataHelper.isRunningOnLiveBranch() ) {
	// 	describe( 'Can Log in on a passwordless account', function() {
	// 		before( function() {
	// 			return driverManager.clearCookiesAndDeleteLocalStorage( driver );
	// 		} );
	//
	// 		describe( 'Can request a magic link email by entering the email of an account which does not have a password defined', function() {
	// 			let magicLoginLink, loginFlow, magicLinkEmail, emailClient;
	// 			before( function() {
	// 				loginFlow = new LoginFlow( driver, [ '+passwordless', '-2fa' ] );
	// 				emailClient = new EmailClient( get( loginFlow.account, 'mailosaur.inboxId' ) );
	// 				return loginFlow.login();
	// 			} );
	//
	// 			step( 'Can find the magic link in the email received', function() {
	// 				return emailClient.pollEmailsByRecipient( loginFlow.account.email ).then( function( emails ) {
	// 					magicLinkEmail = emails.find( email => email.subject.indexOf( 'WordPress.com' ) > -1 );
	// 					assert( magicLinkEmail !== undefined, 'Could not find the magic login email' );
	// 					magicLoginLink = magicLinkEmail.html.links[0].href;
	// 					assert( magicLoginLink !== undefined, 'Could not locate the magic login link in the email' );
	// 					return true;
	// 				} );
	// 			} );
	//
	// 			describe( 'Can use the magic link to log in', function() {
	// 				let magicLoginPage;
	// 				step( 'Visit the magic link and we\'re logged in', function() {
	// 					driver.get( magicLoginLink );
	// 					magicLoginPage = new MagicLoginPage( driver );
	// 					magicLoginPage.finishLogin();
	// 					let readerPage = new ReaderPage( driver );
	// 					return readerPage.displayed().then( function( displayed ) {
	// 						return assert.strictEqual( displayed, true, 'The reader page is not displayed after log in' );
	// 					} );
	// 				} );
	//
	// 				// we should always remove a magic link email once the magic link has been used (even if login failed)
	// 				after( function() {
	// 					if ( magicLinkEmail ) {
	// 						return emailClient.deleteAllEmailByID( magicLinkEmail.id );
	// 					}
	// 				} );
	// 			} );
	//
	// 			after( function() {
	// 				if ( loginFlow ) {
	// 					loginFlow.end();
	// 				}
	// 			} );
	// 		} );
	// 	} );
	// }
	//
	// if ( dataHelper.hasAccountWithFeatures( '+passwordless +2fa-sms' ) && !dataHelper.isRunningOnLiveBranch() ) {
	// 	describe( 'Can Log in on a passwordless account with 2fa using sms', function() {
	// 		before( function() {
	// 			return driverManager.clearCookiesAndDeleteLocalStorage( driver );
	// 		} );
	//
	// 		describe( 'Can request a magic link email by entering the email of an account which does not have a password defined', function() {
	// 			let magicLoginLink, loginFlow, magicLinkEmail, emailClient;
	// 			before( function() {
	// 				loginFlow = new LoginFlow( driver, [ '+passwordless', '+2fa-sms' ] );
	// 				emailClient = new EmailClient( get( loginFlow.account, 'mailosaur.inboxId' ) );
	// 				return loginFlow.login();
	// 			} );
	//
	// 			step( 'Can find the magic link in the email received', function() {
	// 				return emailClient.pollEmailsByRecipient( loginFlow.account.email ).then( function( emails ) {
	// 					magicLinkEmail = emails.find( email => email.subject.indexOf( 'WordPress.com' ) > -1 );
	// 					assert( magicLinkEmail !== undefined, 'Could not find the magic login email' );
	// 					magicLoginLink = magicLinkEmail.html.links[0].href;
	// 					assert( magicLoginLink !== undefined, 'Could not locate the magic login link in the email' );
	// 					return true;
	// 				} );
	// 			} );
	//
	// 			describe( 'Can use the magic link and the code received via sms to log in', function() {
	// 				let magicLoginPage, twoFALoginPage, twoFACode;
	// 				before( function( done ) {
	// 					driver.get( magicLoginLink );
	// 					magicLoginPage = new MagicLoginPage( driver );
	// 					// make sure we listen for SMS before we trigger any
	// 					const xmppClient = listenForSMS( loginFlow.account );
	// 					xmppClient.once( 'e2e:ready', () => {
	// 						// send sms now!
	// 						magicLoginPage.finishLogin();
	// 						twoFALoginPage = new LoginPage( driver );
	// 						twoFALoginPage.use2FAMethod( 'sms' );
	// 					} );
	// 					xmppClient.on( 'e2e:sms', sms => {
	// 						const twoFACodeMatches = sms.body.match( /^\d+/ );
	// 						twoFACode = twoFACodeMatches && twoFACodeMatches[0];
	// 						if ( twoFACode ) {
	// 							xmppClient.stop().then( () => done() );
	// 						}
	// 					} );
	// 				} );
	//
	// 				step( 'Should be on the /log-in/sms page', function() {
	// 					return twoFALoginPage.displayed().then( function() {
	// 						return driver.getCurrentUrl().then( ( urlDisplayed ) => {
	// 							assert( urlDisplayed.indexOf( '/log-in/sms' ) !== -1, 'The 2fa sms page is not displayed after log in' );
	// 						} );
	// 					} );
	// 				} );
	//
	// 				step( 'Enter the 2fa code and we\'re logged in', function() {
	// 					return twoFALoginPage.enter2FACode( twoFACode );
	// 				} );
	//
	// 				// we should always remove a magic link email once the magic link has been used (even if login failed)
	// 				after( function() {
	// 					if ( magicLinkEmail ) {
	// 						return emailClient.deleteAllEmailByID( magicLinkEmail.id );
	// 					}
	// 				} );
	// 			} );
	//
	// 			after( function() {
	// 				if ( loginFlow ) {
	// 					loginFlow.end();
	// 				}
	// 			} );
	// 		} );
	// 	} );
	// }
	//
	// if ( dataHelper.hasAccountWithFeatures( '+passwordless +2fa-otp' ) && !dataHelper.isRunningOnLiveBranch() ) {
	// 	describe( 'Can Log in on a passwordless account with 2fa using authenticator', function() {
	// 		before( function() {
	// 			return driverManager.clearCookiesAndDeleteLocalStorage( driver );
	// 		} );
	//
	// 		describe( 'Can request a magic link email by entering the email of an account which does not have a password defined', function() {
	// 			let magicLoginLink, loginFlow, magicLinkEmail, emailClient;
	// 			before( function() {
	// 				loginFlow = new LoginFlow( driver, [ '+passwordless', '+2fa-otp' ] );
	// 				emailClient = new EmailClient( get( loginFlow.account, 'mailosaur.inboxId' ) );
	// 				return loginFlow.login();
	// 			} );
	//
	// 			step( 'Can find the magic link in the email received', function() {
	// 				return emailClient.pollEmailsByRecipient( loginFlow.account.email ).then( function( emails ) {
	// 					magicLinkEmail = emails.find( email => email.subject.indexOf( 'WordPress.com' ) > -1 );
	// 					assert( magicLinkEmail !== undefined, 'Could not find the magic login email' );
	// 					magicLoginLink = magicLinkEmail.html.links[0].href;
	// 					assert( magicLoginLink !== undefined, 'Could not locate the magic login link in the email' );
	// 					return true;
	// 				} );
	// 			} );
	//
	// 			describe( 'Can use the magic link and the code received via sms to log in', function() {
	// 				let magicLoginPage, twoFALoginPage;
	// 				before( function() {
	// 					driver.get( magicLoginLink );
	// 					magicLoginPage = new MagicLoginPage( driver );
	// 					magicLoginPage.finishLogin();
	// 					twoFALoginPage = new LoginPage( driver );
	// 					return twoFALoginPage.use2FAMethod( 'otp' );
	// 				} );
	//
	// 				step( 'Should be on the /log-in/authenticator page', function() {
	// 					return twoFALoginPage.displayed().then( function() {
	// 						return driver.getCurrentUrl().then( ( urlDisplayed ) => {
	// 							assert( urlDisplayed.indexOf( '/log-in/authenticator' ) !== -1, 'The 2fa authenticator page is not displayed after log in' );
	// 						} );
	// 					} );
	// 				} );
	//
	// 				step( 'Enter the 2fa code and we\'re logged in', function() {
	// 					const twoFACode = speakeasy.totp( {
	// 						secret: loginFlow.account['2faOTPsecret'],
	// 						encoding: 'base32'
	// 					} );
	// 					return twoFALoginPage.enter2FACode( twoFACode );
	// 				} );
	//
	// 				// we should always remove a magic link email once the magic link has been used (even if login failed)
	// 				after( function() {
	// 					if ( magicLinkEmail ) {
	// 						return emailClient.deleteAllEmailByID( magicLinkEmail.id );
	// 					}
	// 				} );
	// 			} );
	//
	// 			after( function() {
	// 				if ( loginFlow ) {
	// 					loginFlow.end();
	// 				}
	// 			} );
	// 		} );
	// 	} );
	// }
} );

describe( `[${ host }] User Agent: (${ screenSize }) @parallel @jetpack`, function() {
	this.timeout( mochaTimeOut );

	before( async function() {
		await driverManager.ensureNotLoggedIn( driver );
	} );

	step( 'Can see the correct user agent set', async function() {
		await WPHomePage.Visit( driver );
		const userAgent = await driver.executeScript( 'return navigator.userAgent;' );
		assert(
			userAgent.match( 'wp-e2e-tests' ),
			`User Agent does not contain 'wp-e2e-tests'.  [${ userAgent }]`
		);
	} );
} );
