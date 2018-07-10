/** @format */

import config from 'config';
import assert from 'assert';

import LoginFlow from '../lib/flows/login-flow.js';

import ReaderPage from '../lib/pages/reader-page.js';
import ReaderManagePage from '../lib/pages/reader-manage-page.js';

import NavBarComponent from '../lib/components/nav-bar-component.js';
import NotificationsComponent from '../lib/components/notifications-component.js';

import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper.js';
import * as eyesHelper from '../lib/eyes-helper.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

let driver;

let eyes = eyesHelper.eyesSetup( true );

before( async function() {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( 'Reader: (' + screenSize + ') @parallel @visdiff', function() {
	this.timeout( mochaTimeOut );

	before( async function() {
		await driverManager.ensureNotLoggedIn( driver );

		let testEnvironment = 'WordPress.com';
		let testName = `Reader [${ global.browserName }] [${ screenSize }]`;
		eyesHelper.eyesOpen( driver, eyes, testEnvironment, testName );
	} );

	describe( 'Log in as commenting user', function() {
		step( 'Can log in as commenting user', async function() {
			this.loginFlow = new LoginFlow( driver, 'commentingUser' );
			return await this.loginFlow.login();
		} );

		describe( 'Leave a comment on the latest post in the Reader', function() {
			step( 'Can see the Reader stream', async function() {
				await ReaderPage.Expect( driver );
			} );

			step( 'The latest post is on the expected test site', async function() {
				const testSiteForNotifications = dataHelper.configGet( 'testSiteForNotifications' );
				const readerPage = await ReaderPage.Expect( driver );
				let siteOfLatestPost = await readerPage.siteOfLatestPost();
				return assert.strictEqual(
					siteOfLatestPost,
					testSiteForNotifications,
					'The latest post is not on the expected test site'
				);
			} );

			step( 'Can comment on the latest post', async function() {
				this.comment = dataHelper.randomPhrase();
				const readerPage = await ReaderPage.Expect( driver );
				await readerPage.commentOnLatestPost( this.comment, eyes );
			} );

			describe( 'Delete the new comment', function() {
				before( async function() {
					await driverManager.ensureNotLoggedIn( driver );
					await driver.get( dataHelper.configGet( 'calypsoBaseURL' ) );
				} );

				step( 'Can log in as test site owner', async function() {
					this.loginFlow = new LoginFlow( driver, 'notificationsUser' );
					return await this.loginFlow.login();
				} );

				step(
					'Can delete the new comment (and wait for UNDO grace period so step is actually deleted)',
					async function() {
						await eyesHelper.eyesScreenshot( driver, eyes, 'Followed Sites Feed' );
						this.navBarComponent = await NavBarComponent.Expect( driver );
						await this.navBarComponent.openNotifications();
						this.notificationsComponent = await NotificationsComponent.Expect( driver );
						await this.notificationsComponent.selectCommentByText( this.comment );
						await this.notificationsComponent.trashComment();
						await this.notificationsComponent.waitForUndoMessage();
						return await this.notificationsComponent.waitForUndoMessageToDisappear();
					}
				);

				describe( 'Manage Followed Sites', function() {
					step( 'Can see the Manage page', async function() {
						this.readerManagePage = await ReaderManagePage.Visit( driver );
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

	after( async function() {
		await eyesHelper.eyesClose( eyes );
	} );
} );
