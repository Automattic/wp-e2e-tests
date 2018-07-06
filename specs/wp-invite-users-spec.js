/** @format */

import assert from 'assert';
import test from 'selenium-webdriver/testing';
import config from 'config';

import LoginFlow from '../lib/flows/login-flow.js';

import AcceptInvitePage from '../lib/pages/accept-invite-page.js';
import PostsPage from '../lib/pages/posts-page.js';
import PeoplePage from '../lib/pages/people-page.js';
import RevokePage from '../lib/pages/revoke-page.js';
import InviteErrorPage from '../lib/pages/invite-error-page.js';
import InvitePeoplePage from '../lib/pages/invite-people-page.js';
import EditTeamMemberPage from '../lib/pages/edit-team-member-page.js';
import LoginPage from '../lib/pages/login-page.js';
import ReaderPage from '../lib/pages/reader-page.js';
import ViewBlogPage from '../lib/pages/signup/view-blog-page.js';
import PrivateSiteLoginPage from '../lib/pages/private-site-login-page.js';
import EditorPage from '../lib/pages/editor-page.js';

import NoticesComponent from '../lib/components/notices-component.js';
import NavBarComponent from '../lib/components/nav-bar-component.js';
import NoSitesComponent from '../lib/components/no-sites-component.js';
import PostEditorToolbarComponent from '../lib/components/post-editor-toolbar-component.js';

import * as dataHelper from '../lib/data-helper.js';
import * as driverManager from '../lib/driver-manager.js';
import EmailClient from '../lib/email-client.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const inviteInboxId = config.get( 'inviteInboxId' );
const password = config.get( 'passwordForNewTestSignUps' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();
const emailClient = new EmailClient( inviteInboxId );

let driver;

test.before( async function() {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

test.describe( `[${ host }] Invites:  (${ screenSize })`, function() {
	this.timeout( mochaTimeOut );

	test.describe( 'Inviting new user as an Editor: @parallel @jetpack', function() {
		this.bailSuite( true );
		const newUserName = 'e2eflowtestingeditor' + new Date().getTime().toString();
		const newInviteEmailAddress = dataHelper.getEmailAddress( newUserName, inviteInboxId );
		let acceptInviteURL = '';

		test.before( async function() {
			await driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'Can log in and navigate to Invite People page', async function() {
			await new LoginFlow( driver ).loginAndSelectPeople();
			const peoplePage = await PeoplePage.Expect( driver );
			return await peoplePage.inviteUser();
		} );

		test.it( 'Can invite a new user as an editor and see its pending', async function() {
			const invitePeoplePage = await InvitePeoplePage.Expect( driver );
			await invitePeoplePage.inviteNewUser(
				newInviteEmailAddress,
				'editor',
				'Automated e2e testing'
			);
			await invitePeoplePage.inviteSent();
			await invitePeoplePage.backToPeopleMenu();

			const peoplePage = await PeoplePage.Expect( driver );
			await peoplePage.selectInvites();
			return await peoplePage.pendingInviteDisplayedFor( newInviteEmailAddress );
		} );

		test.it( 'Can see an invitation email received for the invite', async function() {
			let emails = await emailClient.pollEmailsByRecipient( newInviteEmailAddress );
			let links = emails[ 0 ].html.links;
			let link = links.find( l => l.href.includes( 'accept-invite' ) );
			acceptInviteURL = dataHelper.adjustInviteLinkToCorrectEnvironment( link.href );
			return assert.notEqual(
				acceptInviteURL,
				'',
				'Could not locate the accept invite URL in the invite email'
			);
		} );

		test.it( 'Can sign up as new user for the blog via invite link', async function() {
			await driverManager.ensureNotLoggedIn( driver );

			await driver.get( acceptInviteURL );
			const acceptInvitePage = await AcceptInvitePage.Expect( driver );

			let actualEmailAddress = await acceptInvitePage.getEmailPreFilled();
			let headerInviteText = await acceptInvitePage.getHeaderInviteText();
			assert.strictEqual( actualEmailAddress, newInviteEmailAddress );
			assert( headerInviteText.includes( 'editor' ) );

			await acceptInvitePage.enterUsernameAndPasswordAndSignUp( newUserName, password );
			return await acceptInvitePage.waitUntilNotVisible();
		} );

		test.it( 'User has been added as Editor', async function() {
			await PostsPage.Expect( driver );

			const noticesComponent = await NoticesComponent.Expect( driver );
			const invitesMessageTitleDisplayed = await noticesComponent.inviteMessageTitle();
			return assert(
				invitesMessageTitleDisplayed.includes( 'Editor' ),
				`The invite message '${ invitesMessageTitleDisplayed }' does not include 'Editor'`
			);
		} );

		test.it( 'As the original user can see and remove new user', async function() {
			await driverManager.ensureNotLoggedIn( driver );
			await new LoginFlow( driver ).loginAndSelectPeople();

			const peoplePage = await PeoplePage.Expect( driver );
			await peoplePage.selectTeam();
			await peoplePage.searchForUser( newUserName );
			const numberPeopleShown = await peoplePage.numberSearchResults();
			assert.strictEqual(
				numberPeopleShown,
				1,
				`The number of people search results for '${ newUserName }' was incorrect`
			);

			await peoplePage.selectOnlyPersonDisplayed();
			const editTeamMemberPage = await EditTeamMemberPage.Expect( driver );
			await editTeamMemberPage.removeUserAndDeleteContent();
			const displayed = await peoplePage.successNoticeDisplayed();
			return assert.strictEqual(
				displayed,
				true,
				'The deletion successful notice was not shown on the people page.'
			);
		} );

		test.it( 'As the invited user, I am no longer an editor on the site', async function() {
			await driverManager.ensureNotLoggedIn( driver );
			const loginPage = await LoginPage.Visit( driver );
			await loginPage.login( newUserName, password );
			await ReaderPage.Expect( driver );

			const navBarComponent = await NavBarComponent.Expect( driver );
			await navBarComponent.clickMySites();
			return await NoSitesComponent.Expect( driver );
		} );
	} );

	test.describe(
		'Inviting new user as an Editor and revoke invite: @parallel @jetpack',
		function() {
			this.bailSuite( true );
			const newUserName = 'e2eflowtestingeditor' + new Date().getTime().toString();
			const newInviteEmailAddress = dataHelper.getEmailAddress( newUserName, inviteInboxId );
			let acceptInviteURL = '';

			test.before( async function() {
				return await driverManager.ensureNotLoggedIn( driver );
			} );

			test.it( 'Can log in and navigate to Invite People page', async function() {
				await new LoginFlow( driver ).loginAndSelectPeople();
				const peoplePage = await PeoplePage.Expect( driver );
				return await peoplePage.inviteUser();
			} );

			test.it( 'Can Invite a New User as an Editor, then revoke the invite', async function() {
				const invitePeoplePage = await InvitePeoplePage.Expect( driver );
				await invitePeoplePage.inviteNewUser(
					newInviteEmailAddress,
					'editor',
					'Automated e2e testing'
				);
				await invitePeoplePage.inviteSent();
				await invitePeoplePage.backToPeopleMenu();

				const peoplePage = await PeoplePage.Expect( driver );
				await peoplePage.selectInvites();
				await peoplePage.pendingInviteDisplayedFor( newInviteEmailAddress );

				await peoplePage.goToRevokeInvitePage( newInviteEmailAddress );

				const revokePage = await RevokePage.Expect( driver );
				await revokePage.revokeUser();
				let sent = await revokePage.revokeSent();
				return assert( sent, 'The sent confirmation message was not displayed' );
			} );

			test.it( 'Can see an invitation email received for the invite', async function() {
				let emails = await emailClient.pollEmailsByRecipient( newInviteEmailAddress );
				let links = emails[ 0 ].html.links;
				let link = links.find( l => l.href.includes( 'accept-invite' ) );
				acceptInviteURL = dataHelper.adjustInviteLinkToCorrectEnvironment( link.href );
				return assert.notEqual(
					acceptInviteURL,
					'',
					'Could not locate the accept invite URL in the invite email'
				);
			} );

			test.it( 'Can open the invite page and see it has been revoked', async function() {
				await driverManager.ensureNotLoggedIn( driver );

				await driver.get( acceptInviteURL );
				await AcceptInvitePage.Expect( driver );

				const inviteErrorPage = await InviteErrorPage.Expect( driver );
				let displayed = await inviteErrorPage.inviteErrorTitleDisplayed();
				return assert( displayed, 'The invite was not successfully revoked' );
			} );
		}
	);

	test.describe(
		'Inviting New User as a Viewer of a WordPress.com Private Site: @parallel',
		function() {
			this.bailSuite( true );
			const newUserName = 'e2eflowtestingviewer' + new Date().getTime().toString();
			const newInviteEmailAddress = dataHelper.getEmailAddress( newUserName, inviteInboxId );
			const siteName = config.get( 'privateSiteForInvites' );
			const siteUrl = `https://${ siteName }/`;
			let acceptInviteURL = '';

			test.before( async function() {
				return await driverManager.ensureNotLoggedIn( driver );
			} );

			test.it( 'As an anonymous user I can not see a private site', async function() {
				return await PrivateSiteLoginPage.Visit( driver, siteUrl );
			} );

			test.it( 'Can log in and navigate to Invite People page', async function() {
				await new LoginFlow( driver, 'privateSiteUser' ).loginAndSelectPeople();
				const peoplePage = await PeoplePage.Expect( driver );
				return await peoplePage.inviteUser();
			} );

			test.it( 'Can invite a new user as an editor and see its pending', async function() {
				const invitePeoplePage = await InvitePeoplePage.Expect( driver );
				await invitePeoplePage.inviteNewUser(
					newInviteEmailAddress,
					'viewer',
					'Automated e2e testing'
				);
				await invitePeoplePage.inviteSent();
				await invitePeoplePage.backToPeopleMenu();

				const peoplePage = await PeoplePage.Expect( driver );
				await peoplePage.selectInvites();
				return await peoplePage.pendingInviteDisplayedFor( newInviteEmailAddress );
			} );

			test.it( 'Can see an invitation email received for the invite', async function() {
				let emails = await emailClient.pollEmailsByRecipient( newInviteEmailAddress );
				let links = emails[ 0 ].html.links;
				let link = links.find( l => l.href.includes( 'accept-invite' ) );
				acceptInviteURL = dataHelper.adjustInviteLinkToCorrectEnvironment( link.href );
				return assert.notEqual(
					acceptInviteURL,
					'',
					'Could not locate the accept invite URL in the invite email'
				);
			} );

			test.it( 'Can sign up as new user for the blog via invite link', async function() {
				await driverManager.ensureNotLoggedIn( driver );

				await driver.get( acceptInviteURL );
				const acceptInvitePage = await AcceptInvitePage.Expect( driver );

				let actualEmailAddress = await acceptInvitePage.getEmailPreFilled();
				let headerInviteText = await acceptInvitePage.getHeaderInviteText();
				assert.strictEqual( actualEmailAddress, newInviteEmailAddress );
				assert( headerInviteText.includes( 'view' ) );

				await acceptInvitePage.enterUsernameAndPasswordAndSignUp( newUserName, password );
				return await acceptInvitePage.waitUntilNotVisible();
			} );

			test.it( 'Can see user has been added as a Viewer', async function() {
				const noticesComponent = await NoticesComponent.Expect( driver );
				let followMessageDisplayed = await noticesComponent.followMessageTitle();
				assert.strictEqual(
					true,
					followMessageDisplayed.includes( 'viewer' ),
					`The follow message '${ followMessageDisplayed }' does not include 'viewer'`
				);

				await ReaderPage.Expect( driver );
				return await ViewBlogPage.Visit( driver, siteUrl );
			} );

			test.it( 'Can see new user added and can be removed', async function() {
				await driverManager.ensureNotLoggedIn( driver );
				await new LoginFlow( driver, 'privateSiteUser' ).loginAndSelectPeople();

				const peoplePage = await PeoplePage.Expect( driver );
				await peoplePage.selectViewers();
				let displayed = await peoplePage.viewerDisplayed( newUserName );
				assert(
					displayed,
					`The username of '${ newUserName }' was not displayed as a site viewer`
				);

				await peoplePage.removeUserByName( newUserName );
				await peoplePage.waitForSearchResults();
				displayed = await peoplePage.viewerDisplayed( newUserName );
				return assert.strictEqual(
					displayed,
					false,
					`The username of '${ newUserName }' was still displayed as a site viewer`
				);
			} );

			test.it( 'Can not see the site - see the private site log in page', async function() {
				await driverManager.ensureNotLoggedIn( driver );
				const loginPage = await LoginPage.Visit( driver );
				await loginPage.login( newUserName, password );

				await ReaderPage.Expect( driver );
				return await PrivateSiteLoginPage.Visit( driver, siteUrl );
			} );

			test.after( async function() {
				await new LoginFlow( driver, 'privateSiteUser' ).loginAndSelectPeople();
				const peoplePage = await PeoplePage.Expect( driver );

				await peoplePage.selectViewers();
				let displayed = await peoplePage.viewerDisplayed( newUserName );
				if ( displayed ) {
					await peoplePage.removeUserByName( newUserName );

					return await peoplePage.waitForSearchResults();
				}
			} );
		}
	);

	test.describe(
		'Inviting New User as an Contributor, then change them to Author: @parallel @jetpack',
		function() {
			this.bailSuite( true );

			const newUserName = 'e2eflowtestingcontributor' + new Date().getTime().toString();
			const newInviteEmailAddress = dataHelper.getEmailAddress( newUserName, inviteInboxId );
			const reviewPostTitle = dataHelper.randomPhrase();
			const publishPostTitle = dataHelper.randomPhrase();
			const postQuote =
				'We are all in the gutter, but some of us are looking at the stars.\n— Oscar Wilde, Lady Windermere’s Fan';
			let acceptInviteURL = '';

			test.before( async function() {
				return await driverManager.ensureNotLoggedIn( driver );
			} );

			test.it( 'Can log in and navigate to Invite People page', async function() {
				await new LoginFlow( driver ).loginAndSelectPeople();
				const peoplePage = await PeoplePage.Expect( driver );
				return await peoplePage.inviteUser();
			} );

			test.it( 'Can invite a new user as an editor and see its pending', async function() {
				const invitePeoplePage = await InvitePeoplePage.Expect( driver );
				await invitePeoplePage.inviteNewUser(
					newInviteEmailAddress,
					'contributor',
					'Automated e2e testing'
				);
				await invitePeoplePage.inviteSent();
				await invitePeoplePage.backToPeopleMenu();

				const peoplePage = await PeoplePage.Expect( driver );
				await peoplePage.selectInvites();
				return await peoplePage.pendingInviteDisplayedFor( newInviteEmailAddress );
			} );

			test.it( 'Can see an invitation email received for the invite', async function() {
				let emails = await emailClient.pollEmailsByRecipient( newInviteEmailAddress );
				let links = emails[ 0 ].html.links;
				let link = links.find( l => l.href.includes( 'accept-invite' ) );
				acceptInviteURL = dataHelper.adjustInviteLinkToCorrectEnvironment( link.href );
				return assert.notEqual(
					acceptInviteURL,
					'',
					'Could not locate the accept invite URL in the invite email'
				);
			} );

			test.it( 'Can sign up as new user for the blog via invite link', async function() {
				await driverManager.ensureNotLoggedIn( driver );

				await driver.get( acceptInviteURL );
				const acceptInvitePage = await AcceptInvitePage.Expect( driver );

				let actualEmailAddress = await acceptInvitePage.getEmailPreFilled();
				let headerInviteText = await acceptInvitePage.getHeaderInviteText();
				assert.strictEqual( actualEmailAddress, newInviteEmailAddress );
				assert( headerInviteText.includes( 'contributor' ) );

				await acceptInvitePage.enterUsernameAndPasswordAndSignUp( newUserName, password );
				return await acceptInvitePage.waitUntilNotVisible();
			} );

			test.it( 'Can see a notice welcoming the new user as an contributor', async function() {
				await PostsPage.Expect( driver );
				const noticesComponent = await NoticesComponent.Expect( driver );
				let invitesMessageTitleDisplayed = await noticesComponent.inviteMessageTitle();
				return assert(
					invitesMessageTitleDisplayed.includes( 'Contributor' ),
					`The invite message '${ invitesMessageTitleDisplayed }' does not include 'Contributor'`
				);
			} );

			test.it( 'New user can create a new post', async function() {
				const navbarComponent = await NavBarComponent.Expect( driver );
				await navbarComponent.dismissGuidedTours();
				await navbarComponent.clickCreateNewPost();

				const editorPage = await EditorPage.Expect( driver );
				let urlDisplayed = await driver.getCurrentUrl();
				await editorPage.setABTestControlGroupsInLocalStorage( urlDisplayed );
				await editorPage.enterTitle( reviewPostTitle );
				return await editorPage.enterContent( postQuote );
			} );

			test.it( 'New user can submit the new post for review as pending status', async function() {
				const postEditorToolbar = await PostEditorToolbarComponent.Expect( driver );
				await postEditorToolbar.ensureSaved();
				await postEditorToolbar.submitForReview();
				await postEditorToolbar.waitForIsPendingStatus();
				let isPending = await postEditorToolbar.statusIsPending();
				return assert( isPending, 'The post is not showing as pending' );
			} );

			test.it( 'As the original user, can see new user added to site', async function() {
				await driverManager.ensureNotLoggedIn( driver );
				await new LoginFlow( driver ).loginAndSelectPeople();
				const peoplePage = await PeoplePage.Expect( driver );
				await peoplePage.selectTeam();
				await peoplePage.searchForUser( newUserName );
				let numberPeopleShown = await peoplePage.numberSearchResults();
				return assert.strictEqual(
					numberPeopleShown,
					1,
					`The number of people search results for '${ newUserName }' was incorrect`
				);
			} );

			test.it(
				'As the original user, I can change the contributor user to an author user',
				async function() {
					const peoplePage = await PeoplePage.Expect( driver );

					await peoplePage.selectOnlyPersonDisplayed();
					const editTeamMemberPage = await EditTeamMemberPage.Expect( driver );
					await editTeamMemberPage.changeToNewRole( 'author' );
					let displayed = await editTeamMemberPage.successNoticeDisplayed();
					return assert(
						displayed,
						'The update successful notice was not shown on the edit team member page.'
					);
				}
			);

			test.it( 'As the invited user, I can now publish a post', async function() {
				await driverManager.ensureNotLoggedIn( driver );

				const loginPage = await LoginPage.Visit( driver );
				await loginPage.login( newUserName, password );
				await ReaderPage.Expect( driver );
				const navBarComponent = await NavBarComponent.Expect( driver );
				await navBarComponent.clickCreateNewPost();

				const editorPage = await EditorPage.Expect( driver );
				let urlDisplayed = await driver.getCurrentUrl();
				await editorPage.setABTestControlGroupsInLocalStorage( urlDisplayed );
				await editorPage.enterTitle( publishPostTitle );
				await editorPage.enterContent( postQuote );

				const postEditorToolbar = await PostEditorToolbarComponent.Expect( driver );
				await postEditorToolbar.ensureSaved();
				return await postEditorToolbar.publishAndViewContent( { useConfirmStep: true } );
			} );
		}
	);
} );
