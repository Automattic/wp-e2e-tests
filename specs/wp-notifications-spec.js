import assert from 'assert';
import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager.js';

import LoginFlow from '../lib/flows/login-flow.js';

import AcceptInvitePage from '../lib/pages/accept-invite-page.js';
import PeoplePage from '../lib/pages/people-page.js';
import InvitePeoplePage from '../lib/pages/invite-people-page.js';
import ReaderPage from '../lib/pages/reader-page.js';

import NoticesComponent from '../lib/components/notices-component.js';
import NavbarComponent from '../lib/components/navbar-component.js';
import NotificationsComponent from '../lib/components/notifications-component.js';

import * as dataHelper from '../lib/data-helper.js';

import EmailClient from '../lib/email-client.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const calypsoBaseUrl = config.get( 'calypsoBaseURL' );

var driver;

test.before( 'Start Browser', function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( 'Notifications: (' + screenSize + ')', function() {
	this.timeout( mochaTimeOut );

	test.describe( 'Invite a new user as a follower, then see a notification that the follower has commented on a post', function() {
		this.bailSuite( true );
		const inviteInboxId = config.get( 'inviteInboxId' );
		const testSiteForInvites = config.get( 'testSiteForInvites' );
		const newUserName = 'e2efollower' + new Date().getTime().toString();
		const newInviteEmailAddress = dataHelper.getEmailAddress( newUserName, inviteInboxId );
		const password = config.get( 'passwordForNewTestSignUps' );
		let acceptInviteURL = '';

		test.before( 'Delete Cookies and Local Storage', function() {
			driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.describe( 'Can Invite a New User as a Follower', function() {
			test.before( 'Can log in and select \'Add\' from the People sidebar menu which shows the Invite People page', function() {
				this.loginFlow = new LoginFlow( driver );
				this.loginFlow.loginAndSelectPeople();
				this.peoplePage = new PeoplePage( driver );
				return this.peoplePage.displayed().then( ( displayed ) => {
					return assert.equal( displayed, true, 'The people page is not displayed' );
				} );
			} );

			test.it( 'Can invite a new user as an follower', function() {
				this.peoplePage.inviteUser();
				this.invitePeoplePage = new InvitePeoplePage( driver );
				return this.invitePeoplePage.inviteNewUser( newInviteEmailAddress, 'follower', 'Automated e2e testing' );
			} );

			test.it( 'Sends an invite', function() {
				return this.invitePeoplePage.inviteSent().then( ( sent ) => {
					assert.equal( sent, true, 'The sent confirmation message was not displayed' );
				} );
			} );

			test.describe( 'Can see an invitation email received for the invite', function() {
				test.before( function() {
					this.emailClient = new EmailClient( inviteInboxId );
				} );

				test.it( 'Can see a single confirmation message', function() {
					return this.emailClient.pollEmailsByRecipient( newInviteEmailAddress ).then( function( emails ) {
						assert.equal( emails.length, 1, 'The number of invite emails is not equal to 1' );
					} );
				} );

				test.it( 'Can capture the Accept Invite link from the email', function() {
					return this.emailClient.pollEmailsByRecipient( newInviteEmailAddress ).then( function( emails ) {
						let links = emails[0].html.links;
						for ( let link of links ) {
							if ( link.href.includes( 'accept-invite' ) ) {
								acceptInviteURL = link.href;
								acceptInviteURL = acceptInviteURL.replace( 'https://wordpress.com', calypsoBaseUrl );
							}
						}
						assert.notEqual( acceptInviteURL, '', 'Could not locate the accept invite URL in the invite email' );
					} );
				} );

				test.describe( 'Can open the invite page as a new user', function() {
					test.before( 'Ensure we are not logged in as anyone', function() {
						driverManager.ensureNotLoggedIn( driver );
					} );

					test.it( 'Can visit invite link', function() {
						driver.get( acceptInviteURL );
						this.acceptInvitePage = new AcceptInvitePage( driver );
					} );

					test.describe( 'Can sign up as new user for the blog', function() {
						test.it( 'Can see the email address field is prefilled with the invite email address', function() {
							this.acceptInvitePage.getEmailPreFilled().then( ( actualEmailAddress ) => {
								assert.equal( actualEmailAddress, newInviteEmailAddress, 'The email address prefilled on the accept invite page is not correct' );
							} );
						} );

						test.it( 'Can see the invite header text includes follow', function() {
							this.acceptInvitePage.getHeaderInviteText().then( ( headerInviteText ) => {
								assert.equal( true, headerInviteText.includes( 'follow' ), `The invite header message '${headerInviteText}' does not include 'follow'` );
							} );
						} );

						test.it( 'Can enter new username and password and sign up', function() {
							this.acceptInvitePage.enterUsernameAndPasswordAndSignUp( newUserName, password );
						} );

						test.describe( 'User has been added as a Follower', function() {
							test.it( 'Can see a notice welcoming the new user as an follower', function() {
								this.noticesComponent = new NoticesComponent( driver );
								this.noticesComponent.followMessageTitle().then( ( followMessageDisplayed ) => {
									assert.equal( true, followMessageDisplayed.includes( 'following' ), `The follow message '${followMessageDisplayed}' does not include 'following'` );
								} );
							} );

							test.it( 'Can see the reader stream', function() {
								this.readerPage = new ReaderPage( driver );
							} );

							test.describe( 'New user can comment on a post from the Reader stream', function() {
								test.it( 'The latest post is for the site we were invited to follow', function() {
									this.readerPage.siteOfLatestPost().then( ( siteOfLatestPost ) => {
										assert.equal( siteOfLatestPost, testSiteForInvites, 'The site for the latest reader post is not the test invite site we expected' );
									} );
								} );

								test.it( 'Can capture the title of the post we commented on', function() {
									this.readerPage.latestPostTitle().then( ( title ) => {
										this.commentedPostTitle = title;
									} )
								} );

								test.it( 'Can comment on the latest post in the Reader', function() {
									this.comment = 'This is great';
									this.readerPage.commentOnLatestPost( this.comment );
								} );

								test.describe( 'As the original user, we can see a notification that our new follower commented on the post', function() {
									test.it( 'Log in as original user', function() {
										driverManager.ensureNotLoggedIn( driver );
										this.loginFlow = new LoginFlow( driver );
										this.loginFlow.login();
									} );

									test.it( 'Can see the comment notification with the correct content', function() {
										const expectedContent = `${newUserName} commented on ${this.commentedPostTitle}\n${this.comment}`;
										this.navBarComponent = new NavbarComponent( driver );
										this.navBarComponent.openNotifications();
										this.notificationsComponent = new NotificationsComponent( driver );
										this.notificationsComponent.selectComments();
										this.notificationsComponent.allCommentsContent().then( ( content ) => {
											assert.equal( content.includes( expectedContent ), true, `The actual notifications content '${content}' does not contain expected content '${expectedContent}'` );
										} );
									} );
								} );
							} );
						} );
					} );
				} );
			} );
		} );
	} );
} );
