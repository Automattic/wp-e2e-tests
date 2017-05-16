import test from 'selenium-webdriver/testing';
import config from 'config';
import assert from 'assert';

import LoginFlow from '../lib/flows/login-flow.js';

import ReaderPage from '../lib/pages/reader-page.js';

import NavbarComponent from '../lib/components/navbar-component.js';
import NotificationsComponent from '../lib/components/notifications-component.js';

import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

let driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( 'Reader: (' + screenSize + ') @parallel', function() {
	this.bailSuite( true );
	this.timeout( mochaTimeOut );

	test.before( function() {
		driverManager.clearCookiesAndDeleteLocalStorage( driver );
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
				this.readerPage.commentOnLatestPost( this.comment );
				return this.readerPage.waitForModeratedCommentToAppear();
			} );

			test.describe( 'Delete the new comment', function() {
				test.before( function() {
					driverManager.clearCookiesAndDeleteLocalStorage( driver );
				} );

				test.it( 'Can log in as test site owner', function() {
					this.loginFlow = new LoginFlow( driver, 'notificationsUser' );
					return this.loginFlow.login();
				} );

				test.it( 'Can delete the new comment (and wait for UNDO grace period so it is actually deleted)', function() {
					this.navBarComponent = new NavbarComponent( driver );
					this.navBarComponent.openNotifications();
					this.notificationsComponent = new NotificationsComponent( driver );
					this.notificationsComponent.selectCommentByText( this.comment );
					this.notificationsComponent.trashComment();
					this.notificationsComponent.waitForUndoMessage();
					return this.notificationsComponent.waitForUndoMessageToDisappear();
				} );
			} );
		} );
	} );
} );
