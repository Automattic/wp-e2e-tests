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

	const commentingUser = dataHelper.getAccountConfig( 'commentingUser' )[ 0 ];
	const comment = dataHelper.randomPhrase() + ' TBD';
	let commentedPostTitle;

	test.before( async function() {
		await driverManager.clearCookiesAndDeleteLocalStorage( driver );

		let testEnvironment = 'WordPress.com';
		let testName = `Notifications [${ global.browserName }] [${ screenSize }]`;
		eyesHelper.eyesOpen( driver, eyes, testEnvironment, testName );
	} );

	test.it( 'Can log in as commenting user', async function() {
		const loginFlow = new LoginFlow( driver, 'commentingUser' );
		return await loginFlow.login();
	} );

	test.it( 'Can view the first post', async function() {
		const testSiteForInvitationsURL = `https://${ dataHelper.configGet(
			'testSiteForNotifications'
		) }`;
		const viewBlogPage = new ViewSitePage( driver, true, testSiteForInvitationsURL );
		return await viewBlogPage.viewFirstPost();
	} );

	test.it( 'Can see the first post page and capture the title', async function() {
		const viewPostPage = new ViewPostPage( driver );
		commentedPostTitle = await viewPostPage.postTitle();
	} );

	test.it( 'Can leave a comment', async function() {
		const viewPostPage = new ViewPostPage( driver );
		return await viewPostPage.leaveAComment( comment );
	} );

	test.it( 'Can see the comment', async function() {
		const viewPostPage = new ViewPostPage( driver );
		const shown = await viewPostPage.commentEventuallyShown( comment );
		if ( shown === false ) {
			return slackNotifier.warn(
				`Could not see newly added comment '${ comment }' on blog page - most likely a refresh issue`
			);
		}
	} );

	test.it( 'Can log in as notifications user', async function() {
		const loginFlow = new LoginFlow( driver, 'notificationsUser' );
		return await loginFlow.login();
	} );

	test.it( 'Can open notifications tab with keyboard shortcut', async function() {
		const navBarComponent = new NavbarComponent( driver );
		await navBarComponent.openNotificationsShortcut();
		const present = await navBarComponent.confirmNotificationsOpen();
		return assert( present, 'Notifications tab is not open' );
	} );

	test.it( 'Can see the notification of the comment', async function() {
		const expectedContent = `${ commentingUser } commented on ${ commentedPostTitle }\n${ comment }`;
		const navBarComponent = new NavbarComponent( driver );
		await navBarComponent.openNotifications();
		const notificationsComponent = new NotificationsComponent( driver );
		await notificationsComponent.selectComments();
		let content = await notificationsComponent.allCommentsContent();
		await eyesHelper.eyesScreenshot( driver, eyes, 'Notifications List' );
		return assert.equal(
			content.includes( expectedContent ),
			true,
			`The actual notifications content '${ content }' does not contain expected content '${ expectedContent }'`
		);
	} );

	test.it(
		'Can delete the comment (and wait for UNDO grace period so it is actually deleted)',
		async function() {
			const notificationsComponent = new NotificationsComponent( driver );
			await notificationsComponent.selectCommentByText( comment );
			await eyesHelper.eyesScreenshot( driver, eyes, 'Single Comment Notification' );
			await notificationsComponent.trashComment();
			await notificationsComponent.waitForUndoMessage();
			return await notificationsComponent.waitForUndoMessageToDisappear();
		}
	);

	test.after( async function() {
		await eyesHelper.eyesClose( eyes );
	} );
} );
