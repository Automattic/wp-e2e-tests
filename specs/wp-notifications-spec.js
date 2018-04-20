/** @format */

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

let driver;

let eyes = eyesHelper.eyesSetup( false );

test.before( async function() {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

test.describe( `[${ host }] Notifications: (${ screenSize }) @parallel @visdiff`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.before( async function() {
		await driverManager.clearCookiesAndDeleteLocalStorage( driver );

		let testEnvironment = 'WordPress.com';
		let testName = `Notifications [${ global.browserName }] [${ screenSize }]`;
		eyesHelper.eyesOpen( driver, eyes, testEnvironment, testName );
	} );

	test.describe( 'Log in as commenting user', function() {
		test.it( 'Can log in as commenting user', async function() {
			this.commentingUser = dataHelper.getAccountConfig( 'commentingUser' )[ 0 ];
			this.loginFlow = new LoginFlow( driver, 'commentingUser' );
			return await this.loginFlow.login();
		} );

		test.describe( 'Leave a comment on the test site for notifications', function() {
			const testSiteForInvitationsURL = `https://${ dataHelper.configGet(
				'testSiteForNotifications'
			) }`;

			test.it( 'Can view the first post', async function() {
				this.viewBlogPage = new ViewSitePage( driver, true, testSiteForInvitationsURL );
				return await this.viewBlogPage.viewFirstPost();
			} );

			test.it( 'Can see the first post page and capture the title', async function() {
				this.viewPostPage = new ViewPostPage( driver );
				let postTitle = await this.viewPostPage.postTitle();
				return ( this.commentedPostTitle = postTitle );
			} );

			test.it( 'Can leave a comment', async function() {
				this.comment = dataHelper.randomPhrase() + ' TBD';
				return await this.viewPostPage.leaveAComment( this.comment );
			} );

			test.it( 'Can see the comment', async function() {
				let shown = await this.viewPostPage.commentEventuallyShown( this.comment );
				if ( shown === false ) {
					slackNotifier.warn(
						`Could not see newly added comment '${
							this.comment
						}' on blog page - most likely a refresh issue`
					);
				}
			} );

			test.describe( 'Log in as notifications user', function() {
				test.it( 'Can log in as notifications user', async function() {
					this.loginFlow = new LoginFlow( driver, 'notificationsUser' );
					return await this.loginFlow.login();
				} );

				test.describe( 'See the notification', function() {
					test.it( 'Can open notifications tab with keyboard shortcut', async function() {
						this.navBarComponent = new NavbarComponent( driver );
						await this.navBarComponent.openNotificationsShortcut();
						let present = await this.navBarComponent.confirmNotificationsOpen();
						assert( present, 'Notifications tab is not open' );
					} );

					test.it( 'Can see the notification of the comment', async function() {
						const expectedContent = `${ this.commentingUser } commented on ${
							this.commentedPostTitle
						}\n${ this.comment }`;
						this.navBarComponent = new NavbarComponent( driver );
						await this.navBarComponent.openNotifications();
						this.notificationsComponent = new NotificationsComponent( driver );
						await this.notificationsComponent.selectComments();
						let content = await this.notificationsComponent.allCommentsContent();
						await eyesHelper.eyesScreenshot( driver, eyes, 'Notifications List' );
						assert.equal(
							content.includes( expectedContent ),
							true,
							`The actual notifications content '${ content }' does not contain expected content '${ expectedContent }'`
						);
					} );

					test.it(
						'Can delete the comment (and wait for UNDO grace period so it is actually deleted)',
						async function() {
							await this.notificationsComponent.selectCommentByText( this.comment );
							await eyesHelper.eyesScreenshot( driver, eyes, 'Single Comment Notification' );
							await this.notificationsComponent.trashComment();
							await this.notificationsComponent.waitForUndoMessage();
							return await this.notificationsComponent.waitForUndoMessageToDisappear();
						}
					);
				} );
			} );
		} );
	} );

	test.after( async function() {
		await eyesHelper.eyesClose( eyes );
	} );
} );
