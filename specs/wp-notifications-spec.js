import assert from 'assert';
import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager.js';
import * as slackNotifier from '../lib/slack-notifier';
import * as dataHelper from '../lib/data-helper';
import * as eyesHelper from '../lib/eyes-helper.js';

import LoginFlow from '../lib/flows/login-flow.js';

import ViewSitePage from '../lib/pages/view-site-page.js';
import ViewPostPage from '../lib/pages/view-post-page.js';

import NavbarComponent from '../lib/components/navbar-component.js';
import NotificationsComponent from '../lib/components/notifications-component.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

var driver;

let eyes = eyesHelper.eyesSetup( true );

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `[${host}] Notifications: (${screenSize}) @parallel`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.before( function() {
		driverManager.clearCookiesAndDeleteLocalStorage( driver );

		let testEnvironment = 'WordPress.com';
		let testName = `Notifications [${global.browserName}] [${screenSize}]`;
		eyesHelper.eyesOpen( driver, eyes, testEnvironment, testName );
	} );

	test.describe( 'Log in as commenting user', function() {
		test.it( 'Can log in as commenting user', function() {
			this.commentingUser = 'e2eflowtestingcommenter';
			this.loginFlow = new LoginFlow( driver, 'commentingUser' );
			return this.loginFlow.login();
		} );

		test.describe( 'Leave a comment on the test site for notifications', function() {
			const testSiteForInvitationsURL = `https://${config.get( 'testSiteForNotifications' )}`;

			test.it( 'Can view the first post', function() {
				this.viewBlogPage = new ViewSitePage( driver, true, testSiteForInvitationsURL );
				return this.viewBlogPage.viewFirstPost();
			} );

			test.it( 'Can see the first post page and capture the title', function() {
				this.viewPostPage = new ViewPostPage( driver );
				return this.viewPostPage.postTitle().then( ( postTitle ) => {
					return this.commentedPostTitle = postTitle;
				} );
			} );

			test.it( 'Can leave a comment', function() {
				this.comment = dataHelper.randomPhrase() + ' TBD';
				return this.viewPostPage.leaveAComment( this.comment );
			} );

			test.it( 'Can see the comment', function() {
				return this.viewPostPage.commentEventuallyShown( this.comment ).then( ( shown ) => {
					if ( shown === false ) {
						slackNotifier.warn( `Could not see newly added comment '${this.comment}' on blog page - most likely a refresh issue` );
					}
				} );
			} );

			test.describe( 'Log in as notifications user', function() {
				test.it( 'Can log in as notifications user', function() {
					this.loginFlow = new LoginFlow( driver, 'notificationsUser' );
					return this.loginFlow.login();
				} );

				test.describe( 'See the notification', function() {
					test.it( 'Can open notifications tab with keyboard shortcut', function() {
						this.navBarComponent = new NavbarComponent( driver );
						this.navBarComponent.openNotificationsShortcut();
						return this.navBarComponent.confirmNotificationsOpen().then( function( present ) {
							assert( present, 'Notifications tab is not open' );
						} );
					} );

					test.it( 'Can see the notification of the comment', function() {
						const expectedContent = `${this.commentingUser} commented on ${this.commentedPostTitle}\n${this.comment}`;
						this.navBarComponent = new NavbarComponent( driver );
						this.navBarComponent.openNotifications();
						if ( process.env.VISDIFF ) {
							eyesHelper.eyesScreenshot( driver, eyes, 'Notifications List' );
						}
						this.notificationsComponent = new NotificationsComponent( driver );
						this.notificationsComponent.selectComments();
						return this.notificationsComponent.allCommentsContent().then( ( content ) => {
							assert.equal( content.includes( expectedContent ), true, `The actual notifications content '${content}' does not contain expected content '${expectedContent}'` );
						} );
					} );

					test.it( 'Can delete the comment (and wait for UNDO grace period so it is actually deleted)', function() {
						this.notificationsComponent.selectCommentByText( this.comment );
						if ( process.env.VISDIFF ) {
							eyesHelper.eyesScreenshot( driver, eyes, 'Single Comment Notification' );
						}
						this.notificationsComponent.trashComment();
						this.notificationsComponent.waitForUndoMessage();
						return this.notificationsComponent.waitForUndoMessageToDisappear();
					} );
				} );
			} );
		} );
	} );

	test.after( function() {
		eyesHelper.eyesClose( eyes );
	} );
} );
