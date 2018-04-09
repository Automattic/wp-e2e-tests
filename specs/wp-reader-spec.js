/** @format */

import test from 'selenium-webdriver/testing';
import config from 'config';
import assert from 'assert';

import LoginFlow from '../lib/flows/login-flow.js';

import ReaderPage from '../lib/pages/reader-page.js';
import ReaderManagePage from '../lib/pages/reader-manage-page.js';

import NavbarComponent from '../lib/components/navbar-component.js';
import NotificationsComponent from '../lib/components/notifications-component.js';

import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper.js';
import * as eyesHelper from '../lib/eyes-helper.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

let driver;

let eyes = eyesHelper.eyesSetup( true );

test.before( async function() {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

test.describe( 'Reader: (' + screenSize + ') @parallel @visdiff', function() {
	this.bailSuite( true );
	this.timeout( mochaTimeOut );

	test.before( async function() {
		await driverManager.clearCookiesAndDeleteLocalStorage( driver );

		let testEnvironment = 'WordPress.com';
		let testName = `Reader [${ global.browserName }] [${ screenSize }]`;
		eyesHelper.eyesOpen( driver, eyes, testEnvironment, testName );
	} );

	test.describe( 'Log in as commenting user', function() {
		test.it( 'Can log in as commenting user', async function() {
			this.loginFlow = await new LoginFlow( driver, 'commentingUser' );
			return await this.loginFlow.login();
		} );

		test.describe( 'Leave a comment on the latest post in the Reader', function() {
			test.it( 'Can see the Reader stream', async function() {
				this.readerPage = await new ReaderPage( driver );
				return await this.readerPage.waitForPage();
			} );

			test.it( 'The latest post is on the expected test site', async function() {
				const testSiteForNotifications = dataHelper.configGet( 'testSiteForNotifications' );
				let siteOfLatestPost = await this.readerPage.siteOfLatestPost();
				assert.equal(
					siteOfLatestPost,
					testSiteForNotifications,
					'The latest post is not on the expected test site'
				);
			} );

			test.it( 'Can comment on the latest post', async function() {
				this.comment = dataHelper.randomPhrase();
				return await this.readerPage.commentOnLatestPost( this.comment, eyes );
			} );

			test.describe( 'Delete the new comment', function() {
				test.before( async function() {
					await driverManager.clearCookiesAndDeleteLocalStorage( driver );
					await driver.get( dataHelper.configGet( 'calypsoBaseURL' ) );
				} );

				test.it( 'Can log in as test site owner', async function() {
					this.loginFlow = await new LoginFlow( driver, 'notificationsUser' );
					return await this.loginFlow.login();
				} );

				test.it(
					'Can delete the new comment (and wait for UNDO grace period so it is actually deleted)',
					async function() {
						await eyesHelper.eyesScreenshot( driver, eyes, 'Followed Sites Feed' );
						this.navBarComponent = await new NavbarComponent( driver );
						await this.navBarComponent.openNotifications();
						this.notificationsComponent = await new NotificationsComponent( driver );
						await this.notificationsComponent.selectCommentByText( this.comment );
						await this.notificationsComponent.trashComment();
						await this.notificationsComponent.waitForUndoMessage();
						return await this.notificationsComponent.waitForUndoMessageToDisappear();
					}
				);

				test.describe( 'Manage Followed Sites', function() {
					test.it( 'Can see the Manage page', async function() {
						this.readerManagePage = await new ReaderManagePage( driver, true );
						await this.readerManagePage.waitForSites();
						await eyesHelper.eyesScreenshot(
							driver,
							eyes,
							'Manage - Recommended Sites',
							this.readerManagePage.recommendedSitesSection
						);
						await eyesHelper.eyesScreenshot(
							driver,
							eyes,
							'Manage - Followed Sites',
							this.readerManagePage.followedSitesSection
						);
					} );
				} );
			} );
		} );
	} );

	test.after( async function() {
		await eyesHelper.eyesClose( eyes );
	} );
} );
