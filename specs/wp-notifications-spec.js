import assert from 'assert';
import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager.js';

import LoginFlow from '../lib/flows/login-flow.js';

import ViewSitePage from '../lib/pages/view-site-page.js';
import ViewPostPage from '../lib/pages/view-post-page.js';

import NavbarComponent from '../lib/components/navbar-component.js';
import NotificationsComponent from '../lib/components/notifications-component.js';

import * as dataHelper from '../lib/data-helper.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

var driver;

test.before( 'Start Browser', function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( 'Notifications: (' + screenSize + ')', function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.before( 'Delete Cookies and Local Storage', function() {
		driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	test.describe( 'Log in as commenting user', function() {
		test.it( 'Can log in as commenting user', function() {
			this.commentingUser = 'e2eflowtestingcommenter';
			this.loginFlow = new LoginFlow( driver, 'commentingUser' );
			this.loginFlow.login();
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
				this.comment = dataHelper.randomPhrase();
				return this.viewPostPage.leaveAComment( this.comment );
			} );

			test.it( 'Can see the comment', function() {
				return this.viewPostPage.commentEventuallyShown( this.comment ).then( ( shown ) => {
					return assert.equal( shown, true, `The comment: '${this.comment}' was not shown on the blog post page after submitting it and waiting for it` );
				} );
			} );

			test.describe( 'Log in as notifications user', function() {
				test.it( 'Can log in as notifications user', function() {
					this.loginFlow = new LoginFlow( driver, 'notificationsUser' );
					this.loginFlow.login();
				} );

				test.describe( 'See the notification', function() {
					test.it( 'Can see the notification of the comment', function() {
						const expectedContent = `${this.commentingUser} commented on ${this.commentedPostTitle}\n${this.comment}`;
						this.navBarComponent = new NavbarComponent( driver );
						this.navBarComponent.openNotifications();
						this.notificationsComponent = new NotificationsComponent( driver );
						this.notificationsComponent.selectComments();
						this.notificationsComponent.allCommentsContent().then( ( content ) => {
							assert.equal( content.includes( expectedContent ), true, `The actual notifications content '${content}' does not contain expected content '${expectedContent}'` );
						} );
					} );

					test.it( 'Can delete the comment', function() {
						this.notificationsComponent.selectCommentByText( this.comment );
						this.notificationsComponent.trashComment();
						this.notificationsComponent.waitForUndoMessage();
					} );
				} );
			} );
		} );
	} );
} );
