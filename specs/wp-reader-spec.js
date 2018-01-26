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

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( 'Reader: (' + screenSize + ') @parallel @visdiff', function() {
	this.bailSuite( true );
	this.timeout( mochaTimeOut );

	test.before( function() {
		driverManager.clearCookiesAndDeleteLocalStorage( driver );

		let testEnvironment = 'WordPress.com';
		let testName = `Reader [${global.browserName}] [${screenSize}]`;
		eyesHelper.eyesOpen( driver, eyes, testEnvironment, testName );
	} );

	test.describe( 'Log in as commenting user', function() {
		test.it( 'Can log in as commenting user', function() {
			this.loginFlow = new LoginFlow( driver, 'commentingUser' );
			return this.loginFlow.login();
		} );

		test.describe( 'Leave a comment on the latest post in the Reader', function() {
			test.it( 'Can see the Reader stream', function() {
				this.readerPage = new ReaderPage( driver );
				return this.readerPage.waitForPage();
			} );

			test.it( 'The latest post is on the expected test site', function() {
				const testSiteForNotifications = config.get( 'testSiteForNotifications' );
				return this.readerPage.siteOfLatestPost().then( ( siteOfLatestPost ) => {
					assert.equal( siteOfLatestPost, testSiteForNotifications, 'The latest post is not on the expected test site' );
				} );
			} );

			test.it( 'Can comment on the latest post', function() {
				this.comment = dataHelper.randomPhrase();
				return this.readerPage.commentOnLatestPost( this.comment, eyes );
			} );

			test.describe( 'Delete the new comment', function() {
				test.before( function() {
					driverManager.clearCookiesAndDeleteLocalStorage( driver ).then( () => {
						driver.get( config.get( 'calypsoBaseURL' ) );
					} );
				} );

				test.it( 'Can log in as test site owner', function() {
					this.loginFlow = new LoginFlow( driver, 'notificationsUser' );
					return this.loginFlow.login();
				} );

				test.it( 'Can delete the new comment (and wait for UNDO grace period so it is actually deleted)', function() {
					eyesHelper.eyesScreenshot( driver, eyes, 'Followed Sites Feed' );
					this.navBarComponent = new NavbarComponent( driver );
					this.navBarComponent.openNotifications();
					this.notificationsComponent = new NotificationsComponent( driver );
					this.notificationsComponent.selectCommentByText( this.comment );
					this.notificationsComponent.trashComment();
					this.notificationsComponent.waitForUndoMessage();
					return this.notificationsComponent.waitForUndoMessageToDisappear();
				} );

				test.describe( 'Manage Followed Sites', function() {
					test.it( 'Can see the Manage page', function() {
						this.readerManagePage = new ReaderManagePage( driver, true );
						this.readerManagePage.waitForSites();
						eyesHelper.eyesScreenshot( driver, eyes, 'Manage - Recommended Sites', this.readerManagePage.recommendedSitesSection );
						eyesHelper.eyesScreenshot( driver, eyes, 'Manage - Followed Sites', this.readerManagePage.followedSitesSection );
					} );
				} );
			} );
		} );
	} );

	test.after( function() {
		eyesHelper.eyesClose( eyes );
	} );
} );
