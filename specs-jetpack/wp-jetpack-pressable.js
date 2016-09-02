import assert from 'assert';
import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager';
import * as dataHelper from '../lib/data-helper';
import * as mediaHelper from '../lib/media-helper';
import * as slackNotifier from '../lib/slack-notifier';

import WPAdminLogonPage from '../lib/pages/wp-admin/wp-admin-logon-page';
import WPAdminHomePage from '../lib/pages/wp-admin/wp-admin-home-page';
import WPAdminSidebar from '../lib/pages/wp-admin/wp-admin-sidebar';
import WPAdminTopbar from '../lib/pages/wp-admin/wp-admin-topbar';
import WPAdminPluginsPage from '../lib/pages/wp-admin/wp-admin-plugins-page';
import WPAdminSettingsSharingPage from '../lib/pages/wp-admin/wp-admin-settings-sharing-page';
import WPAdminJetpackPage from '../lib/pages/wp-admin/wp-admin-jetpack-page';
import WPAdminJetpackSettingsPage from '../lib/pages/wp-admin/wp-admin-jetpack-settings-page';
import WPAdminTbDialogPage from '../lib/pages/wp-admin/wp-admin-tb-dialog';
import WPAdminAddPostPage from '../lib/pages/wp-admin/wp-admin-add-post-page';
import JetpackAuthorizePage from '../lib/pages/jetpack-authorize-page';
import JetpackPlansPage from '../lib/pages/jetpack-plans-page';
import TwitterAuthorizePage from '../lib/pages/external/twitter-authorize-page';
import TumblrAuthorizePage from '../lib/pages/external/tumblr-authorize-page';
import TwitterFeedPage from '../lib/pages/twitter-feed-page';
import FacebookPage from '../lib/pages/external/facebook-page';

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
		test.before( 'Make sure wp-admin home page is displayed', function() {
			this.wpAdminHomePage = new WPAdminHomePage( driver, true );
		} );

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
		let fileDetails;

		test.before( 'Create image file for upload', function() {
			return mediaHelper.createFile().then( function( details ) {
				fileDetails = details;
			} );
		} );

		test.describe( 'Can see, activate and connect publicize functionality for Jetpack', function() {
			test.before( 'Make sure wp-admin home page is displayed', function() {
				this.wpAdminHomePage = new WPAdminHomePage( driver, true );
			} );

			test.before( 'Can open Jetpack Engagement Settings', function() {
				this.wpAdminSidebar = new WPAdminSidebar( driver );
				this.wpAdminSidebar.selectJetpackSettings();
				this.jetpackSettingsPage = new WPAdminJetpackSettingsPage( driver );
				this.jetpackSettingsPage.chooseTabNamed( 'Engagement' );
			} );

			test.it( 'Can disable publicize', function() {
				this.jetpackSettingsPage.disableFeatureNamed( 'Publicize' );
			} );

			test.it( 'Can enable publicize', function() {
				this.jetpackSettingsPage.enableFeatureNamed( 'Publicize' );
			} );

			test.it( 'Can link to sharing settings from publicize', function() {
				this.jetpackSettingsPage.expandFeatureNamed( 'Publicize' );
				this.jetpackSettingsPage.followSettingsLink( 'Publicize' );
				this.wpAdminSettingsSharingPage = new WPAdminSettingsSharingPage( driver );
				return this.wpAdminSettingsSharingPage.displayed().then( ( isDisplayed ) => {
					return assert( isDisplayed, 'The Settings-Sharing Page is NOT displayed' );
				} );
			} );
		} );

		test.describe( 'Connecting Twitter', function() {
			test.before( 'Make sure wp-admin home page is displayed', function() {
				this.wpAdminHomePage = new WPAdminHomePage( driver, true );
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
				return this.wpAdminSettingsSharingPage.twitterAccountShown( twitterAccountUsername ).then( ( shown ) => {
					return assert( shown, 'The twitter account just added is not appearing on the publicize wp-admin page' );
				} );
			} );
		} );

		test.describe( 'Connecting Tumblr', function() {
			test.before( 'Make sure wp-admin home page is displayed', function() {
				driver.sleep( 1000 ).then( ( ) => { // no idea why this is necessary just here
					this.wpAdminHomePage = new WPAdminHomePage( driver, true );
				} );
			} );

			test.it( 'Can add a connection to a Tumblr test account for Publicize', function() {
				const tumblrAccountEmail = config.get( 'tumblrAccountEmail' );
				const tumblrBlogName = config.get( 'tumblrBlogName' );
				const tumblrAccountPassword = config.get( 'tumblrPassword' );
				this.wpAdminSidebar = new WPAdminSidebar( driver );
				this.wpAdminSidebar.selectSettingsSharing();
				this.wpAdminSettingsSharingPage = new WPAdminSettingsSharingPage( driver );
				this.wpAdminSettingsSharingPage.removeTumblrIfExists();
				this.wpAdminSettingsSharingPage.addTumblrConnection();

				this.tumblrAuthorizePage = new TumblrAuthorizePage( driver );
				this.tumblrAuthorizePage.signInAndAllow( tumblrAccountEmail, tumblrAccountPassword );
				this.wPAdminTbDialogPage = new WPAdminTbDialogPage( driver );
				this.wPAdminTbDialogPage.updatedMessageShown().then( ( shown ) => {
					assert( shown, 'The tumblr connected dialog was not displayed in wp-admin' );
				} );
				this.wPAdminTbDialogPage.clickOK();
				return this.wpAdminSettingsSharingPage.tumblrBlogShown( tumblrBlogName ).then( ( shown ) => {
					return assert( shown, 'The tumblr blog just added is not appearing on the publicize wp-admin page' );
				} );
			} );
		} );

		test.describe( 'Connecting Facebook', function() {
			test.before( 'Make sure wp-admin home page is displayed', function() {
				this.wpAdminHomePage = new WPAdminHomePage( driver, true );
			} );

			test.it( 'Can see an existing connection to a Facebook Page for Publicize', function() {
				const facebookPageName = config.get( 'facebookPageName' );
				this.wpAdminSidebar = new WPAdminSidebar( driver );
				this.wpAdminSidebar.selectSettingsSharing();
				this.wpAdminSettingsSharingPage = new WPAdminSettingsSharingPage( driver );
				return this.wpAdminSettingsSharingPage.facebookPageShown( facebookPageName ).then( ( shown ) => {
					assert( shown, `The facebook page name '${facebookPageName}' is not appearing on the publicize wp-admin page` );
				} );
			} );
		} );

		test.describe( 'Can publish a post with an image and see it on all the connected sites', function() {
			const blogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote = 'You can never get a cup of tea large enough or a book long enough to suit me.\nC.S. Lewis\n';
			const facebookPageName = config.get( 'facebookPageName' );
			const twitterAccountUsername = config.get( 'twitterAccount' );
			const tumblrBlogTitle = config.get( 'tumblrBlogTitle' );
			let publicizeMessage = '';

			test.before( 'Make sure wp-admin home page is displayed', function() {
				return this.wpAdminHomePage = new WPAdminHomePage( driver, true );
			} );

			test.it( 'Can open the new post page', function() {
				this.wpAdminTopbar = new WPAdminTopbar( driver );
				this.wpAdminTopbar.createNewPost();
				return this.wpAdminAddPostPage = new WPAdminAddPostPage( driver );
			} );

			test.it( 'Can see the correct publicize defaults', function() {
				return this.wpAdminAddPostPage.publicizeDefaults().then( ( defaultPublicizeText ) => {
					const expectedPublicizeText = `Facebook: ${facebookPageName}, Twitter: @${twitterAccountUsername}, Tumblr: ${tumblrBlogTitle}`;
					assert.equal( defaultPublicizeText, expectedPublicizeText );
				} );
			} );

			test.it( 'Can enter a title, content and an image and publish it', function() {
				this.wpAdminAddPostPage.enterTitle( blogPostTitle );
				this.wpAdminAddPostPage.enterContent( blogPostQuote );
				this.wpAdminAddPostPage.enterPostImage( fileDetails );
				this.wpAdminAddPostPage.waitUntilImageInserted( fileDetails );
				this.wpAdminAddPostPage.publicizeMessageShown().then( ( message ) => {
					assert( message.length > 0 );
					publicizeMessage = message;
				} );
				return this.wpAdminAddPostPage.publish();
			} );

			test.it( 'Can see the post on twitter timeline with an image', function() {
				this.twitterFeedPage = new TwitterFeedPage( driver, twitterAccountUsername, true );
				return this.twitterFeedPage.checkTweetWithPhotoDisplayed( publicizeMessage );
			} );

			test.it( 'Can see the post on Facebook page with an image', function() {
				this.facebookPage = new FacebookPage( driver, facebookPageName, true );
				return this.facebookPage.checkPostWithPhotoDisplayed( publicizeMessage );
			} );
		} );

		test.describe( 'Can publish a post with a custom message (no image) and see it on all the connected sites', function() {
			const blogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote = 'The mind is not a vessel that needs filling, but wood that needs igniting.\nPlutarch\n';
			const facebookPageName = config.get( 'facebookPageName' );
			const twitterAccountUsername = config.get( 'twitterAccount' );
			const tumblrBlogTitle = config.get( 'tumblrBlogTitle' );
			const publicizeMessage = dataHelper.randomPhrase();

			test.before( 'Make sure wp-admin home page is displayed', function() {
				this.wpAdminHomePage = new WPAdminHomePage( driver, true );
			} );

			test.it( 'Can open the new post page', function() {
				this.wpAdminTopbar = new WPAdminTopbar( driver );
				this.wpAdminTopbar.createNewPost();
				this.wpAdminAddPostPage = new WPAdminAddPostPage( driver );
			} );

			test.it( 'Can see the correct publicize defaults', function() {
				return this.wpAdminAddPostPage.publicizeDefaults().then( ( defaultPublicizeText ) => {
					const expectedPublicizeText = `Facebook: ${facebookPageName}, Twitter: @${twitterAccountUsername}, Tumblr: ${tumblrBlogTitle}`;
					assert.equal( defaultPublicizeText, expectedPublicizeText );
				} );
			} );

			test.it( 'Can enter a title, content and an image and publish it', function() {
				this.wpAdminAddPostPage.enterTitle( blogPostTitle );
				return this.wpAdminAddPostPage.enterContent( blogPostQuote );
			} );

			test.it( 'Can enter a custom publicize message', function() {
				return this.wpAdminAddPostPage.enterCustomPublicizeMessage( publicizeMessage );
			} );

			test.it( 'Can publish the post', function() {
				return this.wpAdminAddPostPage.publish();
			} );

			test.it( 'Can see the post on twitter timeline without an image but with the publicize message', function() {
				this.twitterFeedPage = new TwitterFeedPage( driver, twitterAccountUsername, true );
				this.twitterFeedPage.checkTweetWithTextAppears( publicizeMessage );
				return this.twitterFeedPage.isTweetWithPhotoImmediatelyDisplayed( publicizeMessage ).then( ( displayed ) => {
					return assert( !displayed, 'A photo was displayed on Twitter without an image being in the original post' )
				} );
			} );

			test.it( 'Can see the post on Facebook page without an image', function() {
				this.facebookPage = new FacebookPage( driver, facebookPageName, true );
				return this.facebookPage.checkPostWithTextDisplayed( publicizeMessage );
			} );
		} );

		test.describe( 'Can publish a post without an image, and without a custom message, and see it on all the connected sites', function() {
			const blogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote = 'You can never get a cup of tea large enough or a book long enough to suit me.\nC.S. Lewis\n';
			const facebookPageName = config.get( 'facebookPageName' );
			const twitterAccountUsername = config.get( 'twitterAccount' );
			const tumblrBlogTitle = config.get( 'tumblrBlogTitle' );
			let publicizeMessage = '';

			test.before( 'Make sure wp-admin home page is displayed', function() {
				this.wpAdminHomePage = new WPAdminHomePage( driver, true );
			} );

			test.it( 'Can open the new post page', function() {
				this.wpAdminTopbar = new WPAdminTopbar( driver );
				this.wpAdminTopbar.createNewPost();
				return this.wpAdminAddPostPage = new WPAdminAddPostPage( driver );
			} );

			test.it( 'Can see the correct publicize defaults', function() {
				return this.wpAdminAddPostPage.publicizeDefaults().then( ( defaultPublicizeText ) => {
					const expectedPublicizeText = `Facebook: ${facebookPageName}, Twitter: @${twitterAccountUsername}, Tumblr: ${tumblrBlogTitle}`;
					return assert.equal( defaultPublicizeText, expectedPublicizeText );
				} );
			} );

			test.it( 'Can enter a title and content and publish it', function() {
				this.wpAdminAddPostPage.enterTitle( blogPostTitle );
				this.wpAdminAddPostPage.enterContent( blogPostQuote );
				this.wpAdminAddPostPage.publicizeMessageShown().then( ( message ) => {
					assert( message.length > 0 );
					publicizeMessage = message;
				} );
				return this.wpAdminAddPostPage.publish();
			} );

			test.it( 'Can see the post on twitter timeline without an image but with the publicize message', function() {
				this.twitterFeedPage = new TwitterFeedPage( driver, twitterAccountUsername, true );
				this.twitterFeedPage.checkTweetWithTextAppears( publicizeMessage );
				return this.twitterFeedPage.isTweetWithPhotoImmediatelyDisplayed( publicizeMessage ).then( ( displayed ) => {
					assert( !displayed, 'A photo was displayed on Twitter without an image being in the original post' )
				} );
			} );

			test.it( 'Can see the post on Facebook page without an image', function() {
				this.facebookPage = new FacebookPage( driver, facebookPageName, true );
				return this.facebookPage.checkPostWithTextDisplayed( publicizeMessage );
			} );
		} );

		test.after( function() {
			if ( fileDetails ) {
				mediaHelper.deleteFile( fileDetails ).then( function() {} );
			}
		} );
	} );

	test.describe( 'Sharing buttons', function() {
		test.describe( 'Can see and activate sharing buttons functionality for Jetpack', function() {

			test.before( 'Make sure wp-admin home page is displayed', function() {
				this.wpAdminHomePage = new WPAdminHomePage( driver, true );
			} );

			test.before( 'Can open Jetpack Engagement Settings', function() {
				this.wpAdminSidebar = new WPAdminSidebar( driver );
				this.wpAdminSidebar.selectJetpackSettings();
				this.jetpackSettingsPage = new WPAdminJetpackSettingsPage( driver );
				this.jetpackSettingsPage.chooseTabNamed( 'Engagement' );
			} );

			test.it( 'Can disable sharing', function() {
				this.jetpackSettingsPage.disableFeatureNamed( 'Sharing' );
			} );

			test.it( 'Can enable sharing', function() {
				this.jetpackSettingsPage.enableFeatureNamed( 'Sharing' );
			} );

			test.it( 'Can link to sharing settings from publicize', function() {
				this.jetpackSettingsPage.expandFeatureNamed( 'Sharing' );
				this.jetpackSettingsPage.followSettingsLink( 'Sharing' );
				this.wpAdminSettingsSharingPage = new WPAdminSettingsSharingPage( driver );
				return this.wpAdminSettingsSharingPage.displayed().then( ( isDisplayed ) => {
					return assert( isDisplayed, 'The Settings-Sharing Page is NOT displayed' );
				} );
			} );
		} );

		test.xit( 'Add and see all the buttons', function() { } );
		test.xit( 'Buttons work', function() { } );
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
