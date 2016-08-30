import assert from 'assert';
import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager';
import * as slackNotifier from '../lib/slack-notifier';

import WPAdminLogonPage from '../lib/pages/wp-admin/wp-admin-logon-page';
import WPAdminSidebar from '../lib/pages/wp-admin/wp-admin-sidebar';
import WPAdminPluginsPage from '../lib/pages/wp-admin/wp-admin-plugins-page';
import WPAdminSettingsSharingPage from '../lib/pages/wp-admin/wp-admin-settings-sharing-page';
import WPAdminJetpackPage from '../lib/pages/wp-admin/wp-admin-jetpack-page';
import WPAdminJetpackSettingsPage from '../lib/pages/wp-admin/wp-admin-jetpack-settings-page';
import WPAdminTbDialogPage from '../lib/pages/wp-admin/wp-admin-tb-dialog';
import JetpackAuthorizePage from '../lib/pages/jetpack-authorize-page';
import JetpackPlansPage from '../lib/pages/jetpack-plans-page';
import TwitterAuthorizePage from '../lib/pages/external/twitter-authorize-page';

import LoginFlow from '../lib/flows/login-flow';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

var driver;

test.before( 'Start Browser', function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `Jetpack on Pressable: '${ screenSize }'`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.before( 'Delete cookies and local storage', function() {
		driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	test.before( 'Log on to our Pressable Jetpack site', function() {
		this.wpAdminLogonPage = new WPAdminLogonPage( driver, true );
		this.wpAdminLogonPage.logonAsPressableAdmin();
	} );

	test.describe( 'WordPress.com Connect', function() {
		test.it( 'Can connect Jetpack to WordPress.com and see site stats on the dashboard', function() {
			this.wpAdminSidebar = new WPAdminSidebar( driver );
			this.wpAdminSidebar.selectPlugins();
			this.wpAdminPluginsPage = new WPAdminPluginsPage( driver );
			this.wpAdminPluginsPage.deactivateJetpack();
			this.wpAdminPluginsPage.activateJetpack();
			this.wpAdminPluginsPage.JetpackVersionInstalled().then( ( jetpackVersion ) => {
				slackNotifier.warn( `Running Jetpack e2e tests against Jetpack version '${jetpackVersion}'` );
			} );
			this.wpAdminSidebar = new WPAdminSidebar( driver );
			this.wpAdminSidebar.selectJetpack();
			this.wpAdminJetpackPage = new WPAdminJetpackPage( driver );
			this.wpAdminJetpackPage.connectWordPressCom();
			this.jetpackAuthorizePage = new JetpackAuthorizePage( driver );
			this.jetpackAuthorizePage.chooseSignIn();
			this.loginFlow = new LoginFlow( driver, 'jetpackConnectAdminUser' );
			this.loginFlow.loginUsingExistingForm();
			this.jetpackAuthorizePage = new JetpackAuthorizePage( driver );
			this.jetpackAuthorizePage.approveConnection();
			this.jetpackPlansPage = new JetpackPlansPage( driver );
			this.jetpackPlansPage.chooseFreePlan();
			this.wpAdminJetpackPage = new WPAdminJetpackPage( driver );
			this.wpAdminJetpackPage.atAGlanceDisplayed().then( ( atAGlanceDisplayed ) => {
				assert( atAGlanceDisplayed, 'The WP Admin Jetpack \'At a Glance\' page is not displayed after running Jetpack Connect' );
			} );
		} );
	} );

	test.describe( 'Publicize', function() {
		test.it( 'Can see, activate and connect publicize functionality for Jetpack', function() {
			this.wpAdminSidebar = new WPAdminSidebar( driver );
			this.wpAdminSidebar.selectJetpackSettings();
			this.jetpackSettingsPage = new WPAdminJetpackSettingsPage( driver );
			this.jetpackSettingsPage.chooseTabNamed( 'Engagement' );
			this.jetpackSettingsPage.disableFeatureNamed( 'Publicize' );
			this.jetpackSettingsPage.enableFeatureNamed( 'Publicize' );
			this.jetpackSettingsPage.expandFeatureNamed( 'Publicize' );
			this.jetpackSettingsPage.followPublicizeSettingsLink();
			this.wpAdminSettingsSharingPage = new WPAdminSettingsSharingPage( driver );
			this.wpAdminSettingsSharingPage.displayed().then( ( isDisplayed ) => {
				assert( isDisplayed, 'The Settings-Sharing Page is NOT displayed' );
			} );
			return driver.sleep( 5000 ); // This is so that the settings changes take effect - otherwise connecting twitter will fail
		} );

		test.it( 'Can add a connection to a Twitter test account for Publicize', function() {
			const twitterAccountUsername = config.get( 'twitterAccount' );
			const twitterAccountPassword = config.get( 'twitterPassword' );
			this.wpAdminSidebar = new WPAdminSidebar( driver );
			this.wpAdminSidebar.selectSettingsSharing();
			this.wpAdminSettingsSharingPage = new WPAdminSettingsSharingPage( driver );
			this.wpAdminSettingsSharingPage.removeTwitterIfExists();
			this.wpAdminSettingsSharingPage.addTwitterConnection();
			this.twitterAuthorizePage = new TwitterAuthorizePage( driver );
			this.twitterAuthorizePage.signInAndAllow( twitterAccountUsername, twitterAccountPassword );
			this.wPAdminTbDialogPage = new WPAdminTbDialogPage( driver );
			this.wPAdminTbDialogPage.updatedMessageShown().then( ( shown ) => {
				assert( shown, 'The twitter connected dialog was not displayed in wp-admin' );
			} );
			this.wPAdminTbDialogPage.clickOK();
			this.wpAdminSettingsSharingPage.twitterAccountShown( twitterAccountUsername ).then( ( shown ) => {
				assert( shown, 'The twitter account just added is not appearing on the publicize wp-admin page' );
			} );
		} );
		test.xit( 'With an image to all the sites', function() { } );
		test.xit( 'With a custom message to all the sites', function() { } );
		test.xit( 'Without a custom message or image to all the sites', function() { } );
	} );

	test.xdescribe( 'Sharing buttons', function() {
		test.it( 'Add and see all the buttons', function() { } );
		test.it( 'Buttons work', function() { } );
	} );

	test.xdescribe( 'Email Subscriptions', function() {
		test.it( 'Emails are sent', function() { } );
		test.it( 'An email filter works as expected', function() { } );
	} );

	test.xdescribe( 'Related Posts', function() {
		test.it( 'Related posts are shown when enabled', function() { } );
		test.it( 'A related posts filter works as expected', function() { } );
	} );

	test.xdescribe( 'Jetpack Comments', function() {
		test.it( 'A different user can comment', function() { } );
		test.it( 'The author can respond', function() { } );
	} );

	test.xdescribe( 'Notifications', function() {
		test.it( 'Comment on post by master user shows notification on WP.com', function() { } );
		test.it( 'Comment on post by secondary user shows notification for that user on WP.com', function() { } );
	} );

	test.xdescribe( 'Likes', function() {
		test.it( 'Enable likes', function() { } );
		test.it( 'Like a post by a different user from master user - notifications and email', function() { } );
		test.it( 'Like a post by a different user from secondary user - notifications and email', function() { } );
	} );

	test.xdescribe( 'CSS', function() {
		test.it( 'Can add custom CSS to a site and preview/apply it', function() { } );
	} );

	test.xdescribe( 'Calypso', function() {
		test.it( 'See all posts', function() { } );
		test.it( 'See all pages', function() { } );
		test.it( 'See all users', function() { } );
		test.it( 'See all stats', function() { } );
		test.it( 'Manage menu', function() { } );
		test.it( 'Edit a post - see changes in wp-admin', function() { } );
		test.it( 'Edit a post - see changes in Calypso', function() { } );
		test.it( 'Update site settings', function() { } );
	} );

	test.xdescribe( 'Photon', function() {
		test.it( 'Photos appear with photon links', function() { } );
		test.it( 'Galleries work with photon', function() { } );
	} );

	test.xdescribe( 'Debug page', function() {
		test.it( 'Load site in debug page - JSON API', function() { } );
		test.it( 'Use footer debug link to load debug page', function() { } );
	} );

	test.xdescribe( 'Single Sign On', function() {
		test.it( 'SSO as main user', function() { } );
		test.it( 'SSO as another user', function() { } );
		test.it( 'Add an SSO filter', function() { } );
	} );

	test.xdescribe( 'Contact Form', function() {
		test.it( 'Add a contact form', function() { } );
		test.it( 'Receive email about reponse', function() { } );
		test.it( 'Check responses in wp-admin', function() { } );
	} );

	test.xdescribe( 'Carousel', function() {
		test.it( 'Enable carousel - does it work?', function() { } );
	} );

	test.xdescribe( 'Tiled Galleries', function() {
		test.it( 'Do they work?', function() { } );
	} );

	test.xdescribe( 'Post by Email', function() {
		test.it( 'Post by email with an image, link', function() { } );
		test.it( 'Post by email with multiple images (gallery)', function() { } );
		test.it( 'Can see the post in Calypso', function() { } );
	} );

	test.xdescribe( 'Other Features', function() {
		test.it( 'Omnisearch', function() { } );
		test.it( 'Mobile Theme', function() { } );
		test.it( 'Markdown', function() { } );
		test.it( 'Infinite Scroll', function() { } );
		test.it( 'Gravatar Hovercards', function() { } );
		test.it( 'Custom Content Types', function() { } );
		test.it( 'Beautiful Math', function() { } );
		test.it( 'Shortcode Embeds', function() { } );
		test.it( 'Site Verification', function() { } );
		test.it( 'Sitemaps', function() { } );
		test.it( 'WP.me shortlinks', function() { } );
		test.it( 'VideoPress', function() { } );
		test.it( 'Spelling & Grammar', function() { } );
	} );

	test.xdescribe( 'Widgets', function() {
		test.it( 'Visibility conditions', function() { } );
		test.it( 'Contact Info Widget', function() { } );
		test.it( 'Display WordPress posts Widget', function() { } );
		test.it( 'Facebook Page Plugin', function() { } );
		test.it( 'Gallery', function() { } );
		test.it( 'Goodreads', function() { } );
		test.it( 'Google+ Badge', function() { } );
		test.it( 'Gravatar Profile', function() { } );
		test.it( 'Image', function() { } );
		test.it( 'RSS links', function() { } );
		test.it( 'Social Media Icons', function() { } );
		test.it( 'Twitter Timeline', function() { } );
		test.it( 'Upcoming Events', function() { } );
	} );
} );
