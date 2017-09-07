import assert from 'assert';
import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager.js';
import * as mediaHelper from '../lib/media-helper.js';

import LoginFlow from '../lib/flows/login-flow.js';

import AcceptInvitePage from '../lib/pages/accept-invite-page.js';
import PostsPage from '../lib/pages/posts-page.js';
import PeoplePage from '../lib/pages/people-page.js';
import InvitePeoplePage from '../lib/pages/invite-people-page.js';
import EditTeamMemberPage from '../lib/pages/edit-team-member-page.js';
import LoginPage from '../lib/pages/login-page.js';
import ReaderPage from '../lib/pages/reader-page.js';
import ViewBlogPage from '../lib/pages/signup/view-blog-page.js';
import PrivateSiteLoginPage from '../lib/pages/private-site-login-page.js';
import EditorPage from '../lib/pages/editor-page.js';

import NoticesComponent from '../lib/components/notices-component.js';
import NavbarComponent from '../lib/components/navbar-component.js';
import NoSitesComponent from '../lib/components/no-sites-component.js';
import PostEditorToolbarComponent from '../lib/components/post-editor-toolbar-component.js';

import * as dataHelper from '../lib/data-helper.js';

import EmailClient from '../lib/email-client.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const calypsoBaseUrl = config.get( 'calypsoBaseURL' );
const host = dataHelper.getJetpackHost();

var driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

// Faked out test.describe function to enable dynamic skipping of e-mail tests
let testDescribe = test.describe;
if ( process.env.DISABLE_EMAIL === 'true' ) {
	testDescribe = test.xdescribe;
}

testDescribe( `[${host}] Invites:  (${screenSize})`, function() {
	this.timeout( mochaTimeOut );
	const usePublishConfirmation = config.get( 'usePublishConfirmation' );

	test.describe( 'Inviting New User as an Editor: @parallel @jetpack', function() {
		this.bailSuite( true );
		const inviteInboxId = config.get( 'inviteInboxId' );
		const newUserName = 'e2eflowtestingeditor' + new Date().getTime().toString();
		const newInviteEmailAddress = dataHelper.getEmailAddress( newUserName, inviteInboxId );
		const password = config.get( 'passwordForNewTestSignUps' );
		let acceptInviteURL = '';

		test.before( function() {
			driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.describe( 'Can Invite a New User as an Editor, then see and remove that user', function() {
			// Can log in and select People
			test.before( function() {
				this.loginFlow = new LoginFlow( driver );
				this.loginFlow.loginAndSelectPeople();
				this.peoplePage = new PeoplePage( driver );
				return this.peoplePage.displayed().then( ( displayed ) => {
					return assert.equal( displayed, true, 'The people page is not displayed' );
				} );
			} );

			test.it( 'Can choose invite user on People page which shows the Invite People page', function() {
				this.peoplePage = new PeoplePage( driver );
				this.peoplePage.inviteUser();
				this.invitePeoplePage = new InvitePeoplePage( driver );
				return this.invitePeoplePage.displayed().then( ( displayed ) => {
					return assert.equal( displayed, true, 'The invite people page is not displayed' );
				} );
			} );

			test.it( 'Can invite a new user as an editor', function() {
				return this.invitePeoplePage.inviteNewUser( newInviteEmailAddress, 'editor', 'Automated e2e testing' );
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
								if ( config.has( 'liveBranch' ) && config.get( 'liveBranch' ) === 'true' ) {
									acceptInviteURL = acceptInviteURL + '?branch=' + config.get( 'branchName' );
								}
							}
						}
						assert.notEqual( acceptInviteURL, '', 'Could not locate the accept invite URL in the invite email' );
					} );
				} );

				test.describe( 'Can open the invite page as a new user', function() {
					test.before( function() {
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

						test.it( 'Can see the invite header text includes editor', function() {
							this.acceptInvitePage.getHeaderInviteText().then( ( headerInviteText ) => {
								assert.equal( true, headerInviteText.includes( 'editor' ), `The invite header message '${headerInviteText}' does not include 'editor'` );
							} );
						} );

						test.it( 'Can enter new username and password and sign up', function() {
							this.acceptInvitePage.enterUsernameAndPasswordAndSignUp( newUserName, password );
							return this.acceptInvitePage.waitUntilNotVisible();
						} );

						test.describe( 'User has been added as Editor', function() {
							test.it( 'Can see the blog posts page', function() {
								this.postsPage = new PostsPage( driver );
							} );

							test.it( 'Can see a notice welcoming the new user as an editor', function() {
								this.noticesComponent = new NoticesComponent( driver );
								this.noticesComponent.inviteMessageTitle().then( ( invitesMessageTitleDisplayed ) => {
									assert.equal( true, invitesMessageTitleDisplayed.includes( 'Editor' ), `The invite message '${invitesMessageTitleDisplayed}' does not include 'Editor'` );
								} );
							} );

							test.it( 'Capture browser logs', function() {
								driver.manage().logs().get( 'browser' ).then( function( logs ) {
									mediaHelper.writeTextLogFile( JSON.stringify( logs ), 'editor' );
								} );
							} );

							test.describe( 'As the original user, can see new user added to site', function() {
								// Log in as original user
								test.before( function() {
									driverManager.ensureNotLoggedIn( driver );
									this.loginFlow = new LoginFlow( driver );
									this.loginFlow.loginAndSelectPeople();
								} );

								test.it( 'Can see new user added to site under People', function() {
									this.peoplePage = new PeoplePage( driver );
									this.peoplePage.selectTeam();
									this.peoplePage.searchForUser( newUserName );
									this.peoplePage.numberSearchResults().then( ( numberPeopleShown ) => {
										assert.equal( numberPeopleShown, 1, `The number of people search results for '${newUserName}' was incorrect` );
									} );
								} );

								test.describe( 'As the original user, I can remove the new user added to site', function() {
									test.before( function() {
										this.peoplePage.selectOnlyPersonDisplayed();
									} );

									test.it( 'Can see the edit team member page', function() {
										this.editTeamMemberPage = new EditTeamMemberPage( driver );
									} );

									test.it( 'Can remove the team member from the site', function() {
										this.editTeamMemberPage.removeUserAndDeleteContent();
										this.peoplePage = new PeoplePage( driver );
										this.peoplePage.successNoticeDisplayed().then( ( displayed ) => {
											assert.equal( displayed, true, 'The deletion successful notice was not shown on the people page.' );
										} );
									} );

									test.describe( 'As the invited user, I am no longer an editor on the site', function() {
										// Login as the invited user
										test.before( function() {
											driverManager.ensureNotLoggedIn( driver );
											this.loginPage = new LoginPage( driver, true );
											this.loginPage.login( newUserName, password );
											this.ReaderPage = new ReaderPage( driver );
										} );

										test.it( 'My sites has no sites listed', function() {
											this.navbarComponent = new NavbarComponent( driver );
											this.navbarComponent.clickMySites();
											this.noSitesComponent = new NoSitesComponent( driver );
											this.noSitesComponent.displayed().then( ( displayed ) => {
												assert.equal( displayed, true, 'The no sites page is not displayed' );
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

	test.describe( 'Inviting New User as a Follower: @parallel @jetpack', function() {
		this.bailSuite( true );
		const inviteInboxId = config.get( 'inviteInboxId' );
		const newUserName = 'e2eflowtestingfollower' + new Date().getTime().toString();
		const newInviteEmailAddress = dataHelper.getEmailAddress( newUserName, inviteInboxId );
		const password = config.get( 'passwordForNewTestSignUps' );
		let acceptInviteURL = '';

		test.before( function() {
			driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.describe( 'Can Invite a New User as a Follower, then see and remove that user', function() {
			// Can log in and select 'Add' from the People sidebar menu which shows the Invite People page
			test.before( function() {
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
								if ( config.has( 'liveBranch' ) && config.get( 'liveBranch' ) === 'true' ) {
									acceptInviteURL = acceptInviteURL + '?branch=' + config.get( 'branchName' );
								}
							}
						}
						assert.notEqual( acceptInviteURL, '', 'Could not locate the accept invite URL in the invite email' );
					} );
				} );

				test.describe( 'Can open the invite page as a new user', function() {
					test.before( function() {
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
							return this.acceptInvitePage.waitUntilNotVisible();
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

							test.it( 'Capture browser logs', function() {
								driver.manage().logs().get( 'browser' ).then( function( logs ) {
									mediaHelper.writeTextLogFile( JSON.stringify( logs ), 'follower' );
								} );
							} );

							test.describe( 'As the original user, can see new user added to site', function() {
								// Log in as original user
								test.before( function() {
									driverManager.ensureNotLoggedIn( driver );
									this.loginFlow = new LoginFlow( driver );
									this.loginFlow.loginAndSelectPeople();
								} );

								test.it( 'Can see new user added to site under Email Followers', function() {
									this.peoplePage = new PeoplePage( driver );
									this.peoplePage.selectEmailFollowers();
									this.peoplePage.searchForUser( newUserName );
									this.peoplePage.numberSearchResults().then( ( numberPeopleShown ) => {
										assert.equal( numberPeopleShown, 1, `The number of email follower search results for '${newUserName}' was incorrect` );
									} );
								} );

								test.it( 'Can remove the email follower from the site', function() {
									this.peoplePage.removeOnlyEmailFollowerDisplayed();
									this.peoplePage.searchForUser( newUserName );
									this.peoplePage.numberSearchResults().then( ( numberPeopleShown ) => {
										assert.equal( numberPeopleShown, 0, `After deletion, the number of email follower search results for '${newUserName}' was incorrect` );
									} );
									this.peoplePage.cancelSearch();
								} );

								test.it( 'Can remove the follower account from the site', function() {
									this.peoplePage.selectFollowers();
									this.peoplePage.waitForSearchResults();
									this.peoplePage.removeUserByName( newUserName, true );
									this.peoplePage.waitForSearchResults();
									this.peoplePage.viewerDisplayed( newUserName ).then( ( displayed ) => {
										assert.equal( displayed, false, `The username of '${newUserName}' was still displayed as a site viewer` );
									} );
								} );
							} );
						} );
					} );
				} );
			} );
		} );
	} );

	// We don't currently have a Private Jetpack site configured for testing
	if ( host === 'WPCOM' ) {
		test.describe( 'Inviting New User as a Viewer of a Private Site: @parallel @jetpack', function() {
			this.bailSuite( true );

			const inviteInboxId = config.get( 'inviteInboxId' );
			const newUserName = 'e2eflowtestingviewer' + new Date().getTime().toString();
			const newInviteEmailAddress = dataHelper.getEmailAddress( newUserName, inviteInboxId );
			const password = config.get( 'passwordForNewTestSignUps' );
			const siteName = config.get( 'privateSiteForInvites' );
			const siteUrl = `https://${siteName}/`;
			let acceptInviteURL = '';

			test.before( function() {
				driverManager.clearCookiesAndDeleteLocalStorage( driver );
			} );

			test.describe( 'As an anonymous user I can not see a private site', function() {
				test.it( 'Can not see the site - see the private site log in page', function() {
					this.privateSiteLoginPage = new PrivateSiteLoginPage( driver, true, siteUrl );
					this.privateSiteLoginPage.displayed().then( ( displayed ) => {
						assert.equal( displayed, true, `The private site log in page was not displayed for:'${siteUrl}'` );
					} );
				} );
			} );

			test.describe( 'Can Invite a New User as a Viewer of a Private Site, then see and remove that user', function() {
				// Can log in as private site owner and select 'Add' from the People sidebar menu which shows the Invite People page
				test.before( function() {
					this.loginFlow = new LoginFlow( driver, 'privateSiteUser' );
					this.loginFlow.loginAndSelectPeople();
					this.peoplePage = new PeoplePage( driver );
					return this.peoplePage.displayed().then( ( displayed ) => {
						return assert.equal( displayed, true, 'The people page is not displayed' );
					} );
				} );

				test.it( 'Can invite a new user as an viewer', function() {
					this.peoplePage.inviteUser();
					this.invitePeoplePage = new InvitePeoplePage( driver );
					return this.invitePeoplePage.inviteNewUser( newInviteEmailAddress, 'viewer', 'Automated e2e testing' );
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
									if ( config.has( 'liveBranch' ) && config.get( 'liveBranch' ) === 'true' ) {
										acceptInviteURL = acceptInviteURL + '?branch=' + config.get( 'branchName' );
									}
								}
							}
							assert.notEqual( acceptInviteURL, '', 'Could not locate the accept invite URL in the invite email' );
						} );
					} );

					test.describe( 'Can open the invite page as a new user', function() {
						test.before( function() {
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

							test.it( 'Can see the invite header text includes view', function() {
								this.acceptInvitePage.getHeaderInviteText().then( ( headerInviteText ) => {
									assert.equal( true, headerInviteText.includes( 'view' ), `The invite header message '${headerInviteText}' does not include 'view'` );
								} );
							} );

							test.it( 'Can enter new username and password and sign up', function() {
								this.acceptInvitePage.enterUsernameAndPasswordAndSignUp( newUserName, password );
								return this.acceptInvitePage.waitUntilNotVisible();
							} );

							test.describe( 'User has been added as a Viewer', function() {
								test.it( 'Can see a notice welcoming the new user as an viewer', function() {
									this.noticesComponent = new NoticesComponent( driver );
									this.noticesComponent.followMessageTitle().then( ( followMessageDisplayed ) => {
										assert.equal( true, followMessageDisplayed.includes( 'viewer' ), `The follow message '${followMessageDisplayed}' does not include 'viewer'` );
									} );
								} );

								test.it( 'Can see the reader stream', function() {
									this.readerPage = new ReaderPage( driver );
								} );

								test.it( 'Capture browser logs', function() {
									driver.manage().logs().get( 'browser' ).then( function( logs ) {
										mediaHelper.writeTextLogFile( JSON.stringify( logs ), 'viewer-private' );
									} );
								} );

								test.it( 'Can visit and see the site', function() {
									this.viewBlogPage = new ViewBlogPage( driver, true, siteUrl );
									this.viewBlogPage.displayed().then( ( displayed ) => {
										assert.equal( displayed, true, 'The site home page could not be viewed' );
									} );
								} );

								test.describe( 'As the original user, can see new user added to site', function() {
									// Log in as original user
									test.before( function() {
										driverManager.ensureNotLoggedIn( driver );
										this.loginFlow = new LoginFlow( driver, 'privateSiteUser' );
										this.loginFlow.loginAndSelectPeople();
									} );

									test.it( 'Can see new user added to site under People', function() {
										this.peoplePage = new PeoplePage( driver );
										this.peoplePage.selectViewers();
										this.peoplePage.viewerDisplayed( newUserName ).then( ( displayed ) => {
											assert.equal( displayed, true, `The username of '${newUserName}' was not displayed as a site viewer` );
										} );
									} );

									test.describe( 'As the original user, I can remove the new user added to site', function() {
										test.it( 'Can remove the team member from the site', function() {
											this.peoplePage.removeUserByName( newUserName, false );
											this.peoplePage.waitForSearchResults();
											this.peoplePage.viewerDisplayed( newUserName ).then( ( displayed ) => {
												assert.equal( displayed, false, `The username of '${newUserName}' was still displayed as a site viewer` );
											} );
										} );

										test.describe( 'As the invited user, I am no longer a viewer on the site', function() {
											// Login as the invited user
											test.before( function() {
												driverManager.ensureNotLoggedIn( driver );
												this.loginPage = new LoginPage( driver, true );
												this.loginPage.login( newUserName, password );
												this.ReaderPage = new ReaderPage( driver, true );
											} );

											test.it( 'Can not see the site - see the private site log in page', function() {
												this.privateSiteLoginPage = new PrivateSiteLoginPage( driver, true, siteUrl );
												this.privateSiteLoginPage.displayed().then( ( displayed ) => {
													assert.equal( displayed, true, `The private site log in page was not displayed for:'${siteUrl}'` );
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
	}

	// Unsupported on Jetpack until https://github.com/Automattic/wp-calypso/issues/15456 is fixed
	if ( host === 'WPCOM' ) {
		test.describe( 'Inviting New User as an Contributor, then change them to Author: @parallel @jetpack', function() {
			this.bailSuite( true );

			const inviteInboxId = config.get( 'inviteInboxId' );
			const newUserName = 'e2eflowtestingcontributor' + new Date().getTime().toString();
			const newInviteEmailAddress = dataHelper.getEmailAddress( newUserName, inviteInboxId );
			const password = config.get( 'passwordForNewTestSignUps' );
			const reviewPostTitle = dataHelper.randomPhrase();
			const publishPostTitle = dataHelper.randomPhrase();
			const postQuote = 'We are all in the gutter, but some of us are looking at the stars.\n— Oscar Wilde, Lady Windermere’s Fan';
			let acceptInviteURL = '';

			test.before( function() {
				driverManager.clearCookiesAndDeleteLocalStorage( driver );
			} );

			test.describe( 'Can Invite a New User as an Contributor, then see and remove that user', function() {
				// Can log in and select 'Add' from the People sidebar menu which shows the Invite People page
				test.before( function() {
					this.loginFlow = new LoginFlow( driver );
					this.loginFlow.loginAndSelectPeople();
					this.peoplePage = new PeoplePage( driver );
					return this.peoplePage.displayed().then( ( displayed ) => {
						return assert.equal( displayed, true, 'The people page is not displayed' );
					} );
				} );

				test.it( 'Can invite a new user as an contributor', function() {
					this.peoplePage.inviteUser();
					this.invitePeoplePage = new InvitePeoplePage( driver );
					return this.invitePeoplePage.inviteNewUser( newInviteEmailAddress, 'contributor', 'Automated e2e testing' );
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
									if ( config.has( 'liveBranch' ) && config.get( 'liveBranch' ) === 'true' ) {
										acceptInviteURL = acceptInviteURL + '?branch=' + config.get( 'branchName' );
									}
								}
							}
							assert.notEqual( acceptInviteURL, '', 'Could not locate the accept invite URL in the invite email' );
						} );
					} );

					test.describe( 'Can open the invite page as a new user', function() {
						test.before( function() {
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

							test.it( 'Can see the invite header text includes contributor', function() {
								this.acceptInvitePage.getHeaderInviteText().then( ( headerInviteText ) => {
									assert.equal( true, headerInviteText.includes( 'contributor' ), `The invite header message '${headerInviteText}' does not include 'contributor'` );
								} );
							} );

							test.it( 'Can enter new username and password and sign up', function() {
								this.acceptInvitePage.enterUsernameAndPasswordAndSignUp( newUserName, password );
								return this.acceptInvitePage.waitUntilNotVisible();
							} );

							test.describe( 'User has been added as Contributor - Can edit but not publish a post', function() {
								test.it( 'Can see the blog posts page', function() {
									this.postsPage = new PostsPage( driver );
								} );

								test.it( 'Can see a notice welcoming the new user as an contributor', function() {
									this.noticesComponent = new NoticesComponent( driver );
									this.noticesComponent.inviteMessageTitle().then( ( invitesMessageTitleDisplayed ) => {
										assert.equal( true, invitesMessageTitleDisplayed.includes( 'Contributor' ), `The invite message '${invitesMessageTitleDisplayed}' does not include 'Contributor'` );
									} );
								} );

								test.it( 'Capture browser logs', function() {
									driver.manage().logs().get( 'browser' ).then( function( logs ) {
										mediaHelper.writeTextLogFile( JSON.stringify( logs ), 'contributor' );
									} );
								} );

								test.it( 'New user can create a new post', function() {
									this.navbarComponent = new NavbarComponent( driver );
									this.navbarComponent.dismissGuidedTours();
									this.navbarComponent.clickCreateNewPost();
									this.editorPage = new EditorPage( driver );
									this.driver.getCurrentUrl().then( ( urlDisplayed ) => {
										return this.editorPage.setABTestControlGroupsInLocalStorage( urlDisplayed );
									} );
									this.editorPage.enterTitle( reviewPostTitle );
									this.editorPage.enterContent( postQuote );
								} );

								test.it( 'New user can submit the new post for review as pending status', function() {
									this.postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
									this.postEditorToolbarComponent.ensureSaved();
									this.postEditorToolbarComponent.submitForReview();
									this.postEditorToolbarComponent.waitForIsPendingStatus();
									this.postEditorToolbarComponent.statusIsPending().then( ( isPending ) => {
										assert.equal( isPending, true, 'The post is not showing as pending' );
									} )
								} );

								test.describe( 'As the original user, can see new user added to site', function() {
									// Log in as original user
									test.before( function() {
										driverManager.ensureNotLoggedIn( driver );
										this.loginFlow = new LoginFlow( driver );
										this.loginFlow.loginAndSelectPeople();
									} );

									test.it( 'Can see new user added to site under People', function() {
										this.peoplePage = new PeoplePage( driver );
										this.peoplePage.selectTeam();
										this.peoplePage.searchForUser( newUserName );
										this.peoplePage.numberSearchResults().then( ( numberPeopleShown ) => {
											assert.equal( numberPeopleShown, 1, `The number of people search results for '${newUserName}' was incorrect` );
										} );
									} );

									test.describe( 'As the original user, I can change the contributor user to an author user', function() {
										test.before( function() {
											this.peoplePage.selectOnlyPersonDisplayed();
										} );

										test.it( 'Can see the edit team member page', function() {
											this.editTeamMemberPage = new EditTeamMemberPage( driver );
										} );

										test.it( 'Can change the user\'s role to author', function() {
											this.editTeamMemberPage.changeToNewRole( 'author' );
											this.editTeamMemberPage.successNoticeDisplayed().then( ( displayed ) => {
												assert.equal( displayed, true, 'The update successful notice was not shown on the edit team member page.' );
											} );
										} );

										test.describe( 'As the invited user, I can now publish a post', function() {
											// Login as the invited user
											test.before( function() {
												driverManager.ensureNotLoggedIn( driver );
												this.loginPage = new LoginPage( driver, true );
												this.loginPage.login( newUserName, password );
												this.ReaderPage = new ReaderPage( driver );
											} );

											test.it( 'Invited can create a new post', function() {
												this.navbarComponent = new NavbarComponent( driver );
												this.navbarComponent.clickCreateNewPost();
												this.editorPage = new EditorPage( driver );
												this.driver.getCurrentUrl().then( ( urlDisplayed ) => {
													return this.editorPage.setABTestControlGroupsInLocalStorage( urlDisplayed );
												} );
												this.editorPage.enterTitle( publishPostTitle );
												this.editorPage.enterContent( postQuote );
											} );

											test.it( 'New user can publish the post as an author', function() {
												this.postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
												this.postEditorToolbarComponent.ensureSaved();
												return this.postEditorToolbarComponent.publishAndViewContent( { useConfirmStep: usePublishConfirmation } );
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
	}
} );
