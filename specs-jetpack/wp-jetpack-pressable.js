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
import WPAdminSnippetsPage from '../lib/pages/wp-admin/wp-admin-snippets-page';
import WPAdminCSSStylesheetEditorPage from '../lib/pages/wp-admin/wp-admin-css-stylesheet-editor-page';
import WPAdminOmnisearchPage from '../lib/pages/wp-admin/wp-admin-omnisearch-page';
import JetpackAuthorizePage from '../lib/pages/jetpack-authorize-page';
import JetpackPlansPage from '../lib/pages/jetpack-plans-page';
import TwitterAuthorizePage from '../lib/pages/external/twitter-authorize-page';
import TumblrAuthorizePage from '../lib/pages/external/tumblr-authorize-page';
import TwitterFeedPage from '../lib/pages/twitter-feed-page';
import TwitterIntentPage from '../lib/pages/external/twitter-intent-page';
import FacebookPage from '../lib/pages/external/facebook-page';
import ViewSitePage from '../lib/pages/view-site-page';
import ViewPostPage from '../lib/pages/view-post-page';
import JetpackComDebugPage from '../lib/pages/jetpack-com-debug-page';

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

	test.describe( 'Update to Latest Jetpack Version', function() {
		test.before( 'Make sure wp-admin home page is displayed', function() {
			this.wpAdminHomePage = new WPAdminHomePage( driver, true );
		} );

		test.it( 'Can update to the latest Jetpack Version', function() {
			this.wpAdminSidebar = new WPAdminSidebar( driver );
			this.wpAdminSidebar.selectPlugins();
			this.wpAdminPluginsPage = new WPAdminPluginsPage( driver );
			this.wpAdminPluginsPage.JetpackVersionInstalled().then( ( jetpackVersion ) => {
				slackNotifier.warn( `Jetpack version BEFORE updating: '${jetpackVersion}'` );
			} );

			this.wpAdminPluginsPage.updateJetpack();
			this.wpAdminPluginsPage.JetpackVersionInstalled().then( ( jetpackVersion ) => {
				slackNotifier.warn( `Jetpack version AFTER updating: '${jetpackVersion}'` );
			} );
		} );

		test.it( 'Make sure Jetpack is activated', function() {
			this.wpAdminSidebar = new WPAdminSidebar( driver );
			this.wpAdminSidebar.selectPlugins();
			this.wpAdminPluginsPage = new WPAdminPluginsPage( driver );
			return this.wpAdminPluginsPage.activateJetpack();
		} );
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
			this.wpAdminSidebar = new WPAdminSidebar( driver );
			this.wpAdminSidebar.selectJetpack();
			this.wpAdminJetpackPage = new WPAdminJetpackPage( driver );
			this.wpAdminJetpackPage.connectWordPressCom();
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
				return this.wpAdminHomePage = new WPAdminHomePage( driver, true );
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
				return driver.sleep( 3000 ).then( ( ) => { // no idea why this is necessary just here
					return this.wpAdminHomePage = new WPAdminHomePage( driver, true );
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
				return this.wpAdminHomePage = new WPAdminHomePage( driver, true );
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

		test.describe( 'Make sure no unwanted dialogs display on sharing settings page', function() {
			test.before( 'Make sure wp-admin home page is displayed', function() {
				return this.wpAdminHomePage = new WPAdminHomePage( driver, true );
			} );

			test.it( 'Can add a connection to a Tumblr test account for Publicize', function() {
				this.wpAdminSidebar = new WPAdminSidebar( driver );
				this.wpAdminSidebar.selectSettingsSharing();
				this.wpAdminSettingsSharingPage = new WPAdminSettingsSharingPage( driver );
				return this.wpAdminSettingsSharingPage.closeDialogIfAppears();
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

		test.describe( 'Add and see all the buttons', function() {
			test.before( 'Make sure wp-admin home page is displayed', function() {
				this.wpAdminHomePage = new WPAdminHomePage( driver, true );
			} );

			test.before( 'Can open sharing settings', function() {
				this.wpAdminSidebar = new WPAdminSidebar( driver );
				this.wpAdminSidebar.selectSettingsSharing();
				this.wpAdminSettingsSharingPage = new WPAdminSettingsSharingPage( driver );
				return this.wpAdminSettingsSharingPage.displayed().then( ( isDisplayed ) => {
					return assert( isDisplayed, 'The Settings-Sharing Page is NOT displayed' );
				} );
			} );

			test.it( 'Can set sharing buttons to be icon + text ', function() {
				return this.wpAdminSettingsSharingPage.setButtonStyleToIconAndText();
			} );

			test.it( 'Can see zero available buttons (all should be enabled)', function() {
				this.wpAdminSettingsSharingPage.availableSharingButtons().then( ( buttons ) => {
					assert.equal( buttons.length, 0, 'Available sharing buttons are shown when they all should already be enabled' );
				} );
			} );

			test.describe( 'Can see all the individual buttons in both activated and preview', function() {

				test.it( 'Can see Skype sharing activated', function() {
					return this.wpAdminSettingsSharingPage.sharingActivated( 'skype' ).then( ( activated ) => {
						return assert( activated, 'Skype sharing is not activated' );
					} );
				} );

				test.it( 'Can see Skype sharing in the preview', function() {
					return this.wpAdminSettingsSharingPage.sharingPreviewIncludes( 'skype' ).then( ( activated ) => {
						return assert( activated, 'Skype sharing is not in the sharing preview' );
					} );
				} );

				test.it( 'Can see Telegram sharing activated', function() {
					return this.wpAdminSettingsSharingPage.sharingActivated( 'telegram' ).then( ( activated ) => {
						return assert( activated, 'Telegram sharing is not activated' );
					} );
				} );

				test.it( 'Can see Telegram sharing in the preview', function() {
					return this.wpAdminSettingsSharingPage.sharingPreviewIncludes( 'telegram' ).then( ( activated ) => {
						return assert( activated, 'Telegram sharing is not in the sharing preview' );
					} );
				} );

				test.it( 'Can see Email sharing activated', function() {
					return this.wpAdminSettingsSharingPage.sharingActivated( 'email' ).then( ( activated ) => {
						return assert( activated, 'Email sharing is not activated' );
					} );
				} );

				test.it( 'Can see Email sharing in the preview', function() {
					return this.wpAdminSettingsSharingPage.sharingPreviewIncludes( 'email' ).then( ( activated ) => {
						return assert( activated, 'Email sharing is not in the sharing preview' );
					} );
				} );

				test.it( 'Can see LinkedIn sharing activated', function() {
					return this.wpAdminSettingsSharingPage.sharingActivated( 'linkedin' ).then( ( activated ) => {
						return assert( activated, 'LinkedIn sharing is not activated' );
					} );
				} );

				test.it( 'Can see LinkedIn sharing in the preview', function() {
					return this.wpAdminSettingsSharingPage.sharingPreviewIncludes( 'linkedin' ).then( ( activated ) => {
						return assert( activated, 'LinkedIn sharing is not in the sharing preview' );
					} );
				} );

				test.it( 'Can see Print sharing activated', function() {
					return this.wpAdminSettingsSharingPage.sharingActivated( 'print' ).then( ( activated ) => {
						return assert( activated, 'Print sharing is not activated' );
					} );
				} );

				test.it( 'Can see Print sharing in the preview', function() {
					return this.wpAdminSettingsSharingPage.sharingPreviewIncludes( 'print' ).then( ( activated ) => {
						return assert( activated, 'Print sharing is not in the sharing preview' );
					} );
				} );

				test.it( 'Can see Tumblr sharing activated', function() {
					return this.wpAdminSettingsSharingPage.sharingActivated( 'tumblr' ).then( ( activated ) => {
						return assert( activated, 'Tumblr sharing is not activated' );
					} );
				} );

				test.it( 'Can see Tumblr sharing in the preview', function() {
					return this.wpAdminSettingsSharingPage.sharingPreviewIncludes( 'tumblr' ).then( ( activated ) => {
						return assert( activated, 'Tumblr sharing is not in the sharing preview' );
					} );
				} );

				test.it( 'Can see Google+ sharing activated', function() {
					return this.wpAdminSettingsSharingPage.sharingActivated( 'google-plus-1' ).then( ( activated ) => {
						return assert( activated, 'Google+ sharing is not activated' );
					} );
				} );

				test.it( 'Can see Google+ sharing in the preview', function() {
					return this.wpAdminSettingsSharingPage.sharingPreviewIncludes( 'google-plus-1' ).then( ( activated ) => {
						return assert( activated, 'Google+ sharing is not in the sharing preview' );
					} );
				} );

				test.it( 'Can see Reddit sharing activated', function() {
					return this.wpAdminSettingsSharingPage.sharingActivated( 'reddit' ).then( ( activated ) => {
						return assert( activated, 'Reddit sharing is not activated' );
					} );
				} );

				test.it( 'Can see Reddit sharing in the preview', function() {
					return this.wpAdminSettingsSharingPage.sharingPreviewIncludes( 'reddit' ).then( ( activated ) => {
						return assert( activated, 'Reddit sharing is not in the sharing preview' );
					} );
				} );

				test.it( 'Can see Whatsapp sharing activated', function() {
					return this.wpAdminSettingsSharingPage.sharingActivated( 'jetpack-whatsapp' ).then( ( activated ) => {
						return assert( activated, 'Whatsapp sharing is not activated' );
					} );
				} );

				test.it( 'Can see Whatsapp sharing in the preview', function() {
					return this.wpAdminSettingsSharingPage.sharingPreviewIncludes( 'jetpack-whatsapp' ).then( ( activated ) => {
						return assert( activated, 'Whatsapp sharing is not in the sharing preview' );
					} );
				} );

				test.it( 'Can see Facebook sharing activated', function() {
					return this.wpAdminSettingsSharingPage.sharingActivated( 'facebook' ).then( ( activated ) => {
						return assert( activated, 'Facebook sharing is not activated' );
					} );
				} );

				test.it( 'Can see Facebook sharing in the preview', function() {
					return this.wpAdminSettingsSharingPage.sharingPreviewIncludes( 'facebook' ).then( ( activated ) => {
						return assert( activated, 'Facebook sharing is not in the sharing preview' );
					} );
				} );

				test.it( 'Can see Pinterest sharing activated', function() {
					return this.wpAdminSettingsSharingPage.sharingActivated( 'pinterest' ).then( ( activated ) => {
						return assert( activated, 'Pinterest sharing is not activated' );
					} );
				} );

				test.it( 'Can see Pinterest sharing in the preview', function() {
					return this.wpAdminSettingsSharingPage.sharingPreviewIncludes( 'pinterest' ).then( ( activated ) => {
						return assert( activated, 'Pinterest sharing is not in the sharing preview' );
					} );
				} );

				test.it( 'Can see Pocket sharing activated', function() {
					return this.wpAdminSettingsSharingPage.sharingActivated( 'pocket' ).then( ( activated ) => {
						return assert( activated, 'Pocket sharing is not activated' );
					} );
				} );

				test.it( 'Can see Pocket sharing in the preview', function() {
					return this.wpAdminSettingsSharingPage.sharingPreviewIncludes( 'pocket' ).then( ( activated ) => {
						return assert( activated, 'Pocket sharing is not in the sharing preview' );
					} );
				} );

				test.it( 'Can see Twitter sharing activated', function() {
					return this.wpAdminSettingsSharingPage.sharingActivated( 'twitter' ).then( ( activated ) => {
						return assert( activated, 'Twitter sharing is not activated' );
					} );
				} );

				test.it( 'Can see Twitter sharing in the preview', function() {
					return this.wpAdminSettingsSharingPage.sharingPreviewIncludes( 'twitter' ).then( ( activated ) => {
						return assert( activated, 'Twitter sharing is not in the sharing preview' );
					} );
				} );
			} );

			test.it( 'Can make sure sharing buttons are shown everywhere', function() {
				this.wpAdminSettingsSharingPage.showButtonsOnFrontPage();
				this.wpAdminSettingsSharingPage.showButtonsOnPosts();
				this.wpAdminSettingsSharingPage.showButtonsOnPages();
				return this.wpAdminSettingsSharingPage.showButtonsOnMedia();
			} );

			test.it( 'Can save changes', function() {
				return this.wpAdminSettingsSharingPage.saveChanges();
			} );

			test.describe( 'All the buttons work from the home page', function() {
				test.before( 'Visit the home page', function() {
					const siteUrl = `https://${config.get( 'jetpacksite' )}`;
					this.viewSitePage = new ViewSitePage( driver, true, siteUrl );
				} );

				test.describe( 'Can see all the individual sharing buttons', function() {

					test.it( 'Can see Skype sharing button with correct link', function() {
						this.viewSitePage.sharingButtonShown( 'skype' ).then( ( shown ) => {
							assert( shown, 'The skype sharing button was not shown' );
						} );

						this.viewSitePage.sharingButtonLink( 'skype' ).then( ( link ) => {
							assert( link.match( /\/\?share=skype&nb=1$/ ), 'The skype sharing button does not have the correct URL' );
						} );
					} );

					test.it( 'Can see Telegram sharing button with correct link', function() {
						this.viewSitePage.sharingButtonShown( 'telegram' ).then( ( shown ) => {
							assert( shown, 'The telegram sharing button was not shown' );
						} );

						this.viewSitePage.sharingButtonLink( 'telegram' ).then( ( link ) => {
							assert( link.match( /\/\?share=telegram&nb=1$/ ), 'The telegram sharing button does not have the correct URL' );
						} );
					} );

					test.it( 'Can see Email sharing button with correct link', function() {
						this.viewSitePage.sharingButtonShown( 'email' ).then( ( shown ) => {
							assert( shown, 'The email sharing button was not shown' );
						} );

						this.viewSitePage.sharingButtonLink( 'email' ).then( ( link ) => {
							assert( link.match( /\/\?share=email&nb=1$/ ), 'The email sharing button does not have the correct URL' );
						} );
					} );

					test.it( 'Can see LinkedIn sharing button with correct link', function() {
						this.viewSitePage.sharingButtonShown( 'linkedin' ).then( ( shown ) => {
							assert( shown, 'The linkedin sharing button was not shown' );
						} );

						this.viewSitePage.sharingButtonLink( 'linkedin' ).then( ( link ) => {
							assert( link.match( /\/\?share=linkedin&nb=1$/ ), 'The linkedin sharing button does not have the correct URL' );
						} );
					} );

					test.it( 'Can see the print sharing button with correct link', function() {
						this.viewSitePage.sharingButtonShown( 'print' ).then( ( shown ) => {
							assert( shown, 'The print sharing button was not shown' );
						} );
					} );

					test.it( 'Can see Tumblr sharing button with correct link', function() {
						this.viewSitePage.sharingButtonShown( 'tumblr' ).then( ( shown ) => {
							assert( shown, 'The Tumblr sharing button was not shown' );
						} );

						this.viewSitePage.sharingButtonLink( 'tumblr' ).then( ( link ) => {
							assert( link.match( /\/\?share=tumblr&nb=1$/ ), 'The Tumblr sharing button does not have the correct URL' );
						} );
					} );

					test.it( 'Can see Google+ sharing button with correct link', function() {
						this.viewSitePage.sharingButtonShown( 'google-plus-1' ).then( ( shown ) => {
							assert( shown, 'The Google+ sharing button was not shown' );
						} );

						this.viewSitePage.sharingButtonLink( 'google-plus-1' ).then( ( link ) => {
							assert( link.match( /\/\?share=google-plus-1&nb=1$/ ), 'The Google+ sharing button does not have the correct URL' );
						} );
					} );

					test.it( 'Can see Reddit sharing button with correct link', function() {
						this.viewSitePage.sharingButtonShown( 'reddit' ).then( ( shown ) => {
							assert( shown, 'The Reddit sharing button was not shown' );
						} );

						this.viewSitePage.sharingButtonLink( 'reddit' ).then( ( link ) => {
							assert( link.match( /\/\?share=reddit&nb=1$/ ), 'The Reddit sharing button does not have the correct URL' );
						} );
					} );

					test.it( 'Can see Whatsapp sharing button with correct link', function() {
						this.viewSitePage.sharingButtonShown( 'jetpack-whatsapp' ).then( ( shown ) => {
							assert( shown, 'The Whatsapp sharing button was not shown' );
						} );

						this.viewSitePage.sharingButtonLink( 'jetpack-whatsapp' ).then( ( link ) => {
							assert( link.match( /^whatsapp:\/\/send\?/ ), 'The Whatsapp sharing button does not have the correct URL' );
						} );
					} );

					test.it( 'Can see Facebook sharing button with correct link', function() {
						this.viewSitePage.sharingButtonShown( 'facebook' ).then( ( shown ) => {
							assert( shown, 'The Facebook sharing button was not shown' );
						} );

						this.viewSitePage.sharingButtonLink( 'facebook' ).then( ( link ) => {
							assert( link.match( /\/\?share=facebook&nb=1$/ ), 'The Facebook sharing button does not have the correct URL' );
						} );
					} );

					test.it( 'Can see Pinterest sharing button with correct link', function() {
						this.viewSitePage.sharingButtonShown( 'pinterest' ).then( ( shown ) => {
							assert( shown, 'The Pinterest sharing button was not shown' );
						} );

						this.viewSitePage.sharingButtonLink( 'pinterest' ).then( ( link ) => {
							assert( link.match( /\/\?share=pinterest&nb=1$/ ), 'The Pinterest sharing button does not have the correct URL' );
						} );
					} );

					test.it( 'Can see Pocket sharing button with correct link', function() {
						this.viewSitePage.sharingButtonShown( 'pocket' ).then( ( shown ) => {
							assert( shown, 'The Pocket sharing button was not shown' );
						} );

						this.viewSitePage.sharingButtonLink( 'pocket' ).then( ( link ) => {
							assert( link.match( /\/\?share=pocket&nb=1$/ ), 'The Pocket sharing button does not have the correct URL' );
						} );
					} );

					test.it( 'Can see Twitter sharing button with correct link', function() {
						this.viewSitePage.sharingButtonShown( 'twitter' ).then( ( shown ) => {
							assert( shown, 'The Twitter sharing button was not shown' );
						} );

						this.viewSitePage.sharingButtonLink( 'twitter' ).then( ( link ) => {
							assert( link.match( /\/\?share=twitter&nb=1$/ ), 'The Twitter sharing button does not have the correct URL' );
						} );
					} );
				} );

				test.describe( 'Can share the content to twitter', function() {
					let postTitle = '';
					let postURL = '';

					test.it( 'Can capture values for expected tweet text', function() {
						this.viewSitePage.firstPostTitle().then( ( title ) => {
							postTitle = title;
						} );

						this.viewSitePage.firstPostURL().then( ( url ) => {
							postURL = url;
						} );
					} );

					test.it( 'The share to twitter button works when clicked', function() {
						const twitterAccountUsername = config.get( 'twitterAccount' );
						const expectedTweetText = `${postTitle} ${postURL} via @${twitterAccountUsername}`;
						this.viewSitePage.followShareToTwitter();
						this.twitterIntentPage = new TwitterIntentPage( driver );
						return this.twitterIntentPage.prefilledTweet().then( ( tweetText ) => {
							assert.equal( tweetText, expectedTweetText, 'The actual tweet text is not expected' );
						} );
					} );
				} );
			} );
		} );
	} );

	test.describe( 'Related Posts', function() {
		test.describe( 'Can see and activate related posts functionality for Jetpack', function() {

			test.before( 'Make sure wp-admin home page is displayed', function() {
				this.wpAdminHomePage = new WPAdminHomePage( driver, true );
			} );

			test.before( 'Can open Jetpack Engagement Settings', function() {
				this.wpAdminSidebar = new WPAdminSidebar( driver );
				this.wpAdminSidebar.selectJetpackSettings();
				this.jetpackSettingsPage = new WPAdminJetpackSettingsPage( driver );
				return this.jetpackSettingsPage.chooseTabNamed( 'Engagement' );
			} );

			test.it( 'Can disable related posts', function() {
				return this.jetpackSettingsPage.disableFeatureNamed( 'Related Posts' );
			} );

			test.it( 'Can enable related posts', function() {
				return this.jetpackSettingsPage.enableFeatureNamed( 'Related Posts' );
			} );

			test.it( 'Can link to customize the related posts options within the Jetpack dashboard', function() {
				this.jetpackSettingsPage.expandFeatureNamed( 'Related Posts' );
				return this.jetpackSettingsPage.followSettingsLink( 'Related Posts' );
			} );

			test.xit( 'Can use customizer to change related posts options', function() {
			} );
		} );

		test.describe( 'Related posts are shown as large and with header', function() {
			test.before( 'Visit the home page and open the first post', function() {
				const siteUrl = `https://${config.get( 'jetpacksite' )}`;
				this.viewSitePage = new ViewSitePage( driver, true, siteUrl );
				this.viewSitePage.viewFirstPost();
				this.viewPostPage = new ViewPostPage( driver );
			} );

			test.it( 'Can see Large Related Posts', function() {
				this.viewPostPage.relatedPostsLargeShown().then( ( shown ) => {
					assert( shown, 'Large related posts aren\'t being shown on the posts page' );
				} );
			} );

			test.it( 'Can see Related Posts Header', function() {
				this.viewPostPage.relatedPostsHeaderShown().then( ( shown ) => {
					assert( shown, 'The related posts header isn\'t being shown on the posts page' );
				} );
			} );
		} );

		test.describe( 'A related posts filter works as expected', function() {

			test.before( 'Make sure wp-admin home page is displayed', function() {
				this.wpAdminHomePage = new WPAdminHomePage( driver, true );
			} );

			test.it( 'Make sure the snippet to show four related posts is active', function() {
				this.wpAdminSidebar = new WPAdminSidebar( driver );
				this.wpAdminSidebar.selectSnippets();
				this.wpAdminSnippetsPage = new WPAdminSnippetsPage( driver );
				this.wpAdminSnippetsPage.snippetIsActive( 'Related Posts Show Four' ).then( ( active ) => {
					assert( active, 'The snippet to show four related posts does not exist or is not active' );
				} );
			} );

			test.it( 'Make sure four related posts are shown on the posts page', function() {
				const siteUrl = `https://${config.get( 'jetpacksite' )}`;
				this.viewSitePage = new ViewSitePage( driver, true, siteUrl );
				this.viewSitePage.viewFirstPost();
				this.viewPostPage = new ViewPostPage( driver );
				this.viewPostPage.relatedPostsShown().then( ( relatedPosts ) => {
					assert( relatedPosts.length, 4, 'The number of related posts isn\'t correct' );
				} );
			} );
		} );
	} );

	test.describe( 'Likes', function() {
		test.describe( 'Can see and activate likes functionality for Jetpack', function() {

			test.before( 'Make sure wp-admin home page is displayed', function() {
				this.wpAdminHomePage = new WPAdminHomePage( driver, true );
			} );

			test.before( 'Can open Jetpack Engagement Settings', function() {
				this.wpAdminSidebar = new WPAdminSidebar( driver );
				this.wpAdminSidebar.selectJetpackSettings();
				this.jetpackSettingsPage = new WPAdminJetpackSettingsPage( driver );
				return this.jetpackSettingsPage.chooseTabNamed( 'Engagement' );
			} );

			test.it( 'Can disable Likes', function() {
				return this.jetpackSettingsPage.disableFeatureNamed( 'Likes' );
			} );

			test.it( 'Can enable Likes', function() {
				return this.jetpackSettingsPage.enableFeatureNamed( 'Likes' );
			} );

			test.it( 'Can set Likes options directly within the Jetpack dashboard - and follow link to settings', function() {
				this.jetpackSettingsPage.expandFeatureNamed( 'Likes' );
				this.jetpackSettingsPage.chooseLikesPerPost();
				this.jetpackSettingsPage.chooseLikesForAllPosts();
				this.jetpackSettingsPage.saveFeatureSettings( 'Likes' );
				this.jetpackSettingsPage.followLikeSettingsLink();
				this.wpAdminSettingsSharingPage = new WPAdminSettingsSharingPage( driver );
				return this.wpAdminSettingsSharingPage.displayed().then( ( isDisplayed ) => {
					return assert( isDisplayed, 'The Settings-Sharing Page is NOT displayed' );
				} );
			} );
		} );

		test.xdescribe( 'Like a post by a different user from master user - notifications and email', function() {
			let postUrl;

			test.before( 'Publish a post so other user can like it', function() {
				const blogPostTitle = dataHelper.randomPhrase();
				const blogPostQuote = 'Most people carry that pain around inside them their whole lives, until they kill the pain by other means, or until it kills them. But you, my friends, you found another way: a way to use the pain. To burn it as fuel, for light and warmth. You have learned to break the world that has tried to break you.\nLev Grossman\n';

				this.wpAdminHomePage = new WPAdminHomePage( driver, true );
				this.wpAdminTopbar = new WPAdminTopbar( driver );
				this.wpAdminTopbar.createNewPost();
				this.wpAdminAddPostPage = new WPAdminAddPostPage( driver );
				this.wpAdminAddPostPage.enterTitle( blogPostTitle );
				this.wpAdminAddPostPage.enterContent( blogPostQuote );
				this.wpAdminAddPostPage.publish();
				this.wpAdminAddPostPage.viewPostLink().then( ( viewPostLink ) => {
					postUrl = viewPostLink;
				} );
			} );

			test.it( 'As a signed in reader of the Jetpack blog I can like a new post', function() {
				driverManager.clearCookiesAndDeleteLocalStorage( driver );

				this.loginFlow = new LoginFlow( driver, 'jetpackLikeUser');
				this.loginFlow.login();

				driver.get( postUrl );
				this.viewPostPage = new ViewPostPage( driver );
				return this.viewPostPage.likePost();
			} );
		} );
		test.xit( 'Like a post by a different user from secondary user - notifications and email', function() { } );
	} );

	test.describe( 'Email Subscriptions', function() {
		test.describe( 'Can see and activate Email Subscriptions functionality for Jetpack', function() {
			test.before( 'Make sure wp-admin home page is displayed', function() {
				this.wpAdminHomePage = new WPAdminHomePage( driver, true );
			} );

			test.before( 'Can open Jetpack Engagement Settings', function() {
				this.wpAdminSidebar = new WPAdminSidebar( driver );
				this.wpAdminSidebar.selectJetpackSettings();
				this.jetpackSettingsPage = new WPAdminJetpackSettingsPage( driver );
				return this.jetpackSettingsPage.chooseTabNamed( 'Engagement' );
			} );

			test.it( 'Can disable Subscriptions', function() {
				return this.jetpackSettingsPage.disableFeatureNamed( 'Subscriptions' );
			} );

			test.it( 'Can enable Subscriptions', function() {
				return this.jetpackSettingsPage.enableFeatureNamed( 'Subscriptions' );
			} );

			test.it( 'Can set Subscriptions options directly within the Jetpack dashboard - and see a link to email followers', function() {
				const jetpackSite = config.get( 'jetpacksite' );
				this.jetpackSettingsPage.expandFeatureNamed( 'Subscriptions' );
				this.jetpackSettingsPage.showAFollowBlogOptionInComments();
				this.jetpackSettingsPage.showAFollowCommentsOptionInComments();
				this.jetpackSettingsPage.saveFeatureSettings( 'Subscriptions' );
				return this.jetpackSettingsPage.linkToEmailsFollowersDisplayed( jetpackSite ).then( ( displayed ) => {
					return assert( displayed, 'The link to email followers in Calypso is not displayed' );
				} );
			} );
		} );
		test.xit( 'Emails are sent', function() { } );
		test.xit( 'An email filter works as expected', function() { } );
	} );

	test.xdescribe( 'Jetpack Comments', function() {
		test.it( 'A different user can comment', function() { } );
		test.it( 'The author can respond', function() { } );
	} );

	test.xdescribe( 'Notifications', function() {
		test.it( 'Comment on post by master user shows notification on WP.com', function() { } );
		test.it( 'Comment on post by secondary user shows notification for that user on WP.com', function() { } );
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

	test.describe( 'Photon', function() {
		test.describe( 'Can see and activate Photon functionality for Jetpack', function() {
			let postUrl;
			let fileDetails;

			test.before( 'Create image file for upload', function() {
				return mediaHelper.createFile().then( function( details ) {
					fileDetails = details;
				} );
			} );

			test.before( 'Publish a post with an image', function() {
				const blogPostTitle = dataHelper.randomPhrase();
				const blogPostQuote = 'It is characteristic of a great soul to scorn great things and prefer what is ordinary\nSeneca\n';

				this.wpAdminHomePage = new WPAdminHomePage( driver, true );
				this.wpAdminTopbar = new WPAdminTopbar( driver );
				this.wpAdminTopbar.createNewPost();
				this.wpAdminAddPostPage = new WPAdminAddPostPage( driver );
				this.wpAdminAddPostPage.enterTitle( blogPostTitle );
				this.wpAdminAddPostPage.enterContent( blogPostQuote );
				this.wpAdminAddPostPage.enterPostImage( fileDetails );
				this.wpAdminAddPostPage.waitUntilImageInserted( fileDetails );
				this.wpAdminAddPostPage.publish();
				this.wpAdminAddPostPage.viewPostLink().then( ( viewPostLink ) => {
					postUrl = viewPostLink;
				} );
			} );

			test.it( 'Can open Jetpack Appearance Settings and disable Photon', function() {
				this.wpAdminHomePage = new WPAdminHomePage( driver, true );
				this.wpAdminSidebar = new WPAdminSidebar( driver );
				this.wpAdminSidebar.selectJetpackSettings();
				this.jetpackSettingsPage = new WPAdminJetpackSettingsPage( driver );
				this.jetpackSettingsPage.chooseTabNamed( 'Appearance' );
				return this.jetpackSettingsPage.disableFeatureNamed( 'Photon' );
			} );

			test.it( 'Can verify that images are NOT using photon links', function() {
				driver.get( postUrl );
				this.viewPostPage = new ViewPostPage( driver );
				return this.viewPostPage.postImageUsingPhoton().then( ( usingPhoton ) => {
					assert.equal( usingPhoton, false, 'The images are using Photon when they should not be' );
				} );
			} );

			test.it( 'Can open Jetpack Appearance Settings and enable Photon', function() {
				this.wpAdminHomePage = new WPAdminHomePage( driver, true );
				this.wpAdminSidebar = new WPAdminSidebar( driver );
				this.wpAdminSidebar.selectJetpackSettings();
				this.jetpackSettingsPage = new WPAdminJetpackSettingsPage( driver );
				this.jetpackSettingsPage.chooseTabNamed( 'Appearance' );
				return this.jetpackSettingsPage.enableFeatureNamed( 'Photon' );
			} );

			test.it( 'Can verify that images are using photon links', function() {
				driver.get( postUrl );
				this.viewPostPage = new ViewPostPage( driver );
				return this.viewPostPage.postImageUsingPhoton().then( ( usingPhoton ) => {
					assert.equal( usingPhoton, true, 'The images are not using Photon when they should be' );
				} );
			} );
		} );
	} );

	test.describe( 'Jetpack.com Debug page', function() {
		const jetpackSite = config.get( 'jetpacksite' );

		test.it( 'Load site in debug page - JSON API', function() {
			this.jetpackComDebugPage = new JetpackComDebugPage( driver, { visit: true, jetpackSiteUrl: jetpackSite } );
			this.jetpackComDebugPage.status().then( ( status ) => {
				assert.equal( status, 'Everything looks great!' );
			} );
		} );
		test.xit( 'Use footer debug link to load debug page', function() { } );
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

	test.describe( 'Other Features', function() {
		test.describe( 'Omnisearch', function() {
			test.it( 'Can open Jetpack Settings and search for and enable Omnisearch', function() {
				this.wpAdminHomePage = new WPAdminHomePage( driver, true );
				this.wpAdminSidebar = new WPAdminSidebar( driver );
				this.wpAdminSidebar.selectJetpackSettings();
				this.jetpackSettingsPage = new WPAdminJetpackSettingsPage( driver );
				this.jetpackSettingsPage.searchFor( 'Omnisearch' );
				this.jetpackSettingsPage.disableFeatureNamed( 'Omnisearch' );
				return this.jetpackSettingsPage.enableFeatureNamed( 'Omnisearch' );
			} );

			test.it( 'Can link to Omnisearch page from Omnisearch settings', function() {
				this.jetpackSettingsPage.expandFeatureNamed( 'Omnisearch' );
				this.jetpackSettingsPage.followSettingsLink( 'Omnisearch' );
				this.wPAdminOmnisearchPage = new WPAdminOmnisearchPage( driver );
				return this.wPAdminOmnisearchPage.displayed().then( ( isDisplayed ) => {
					return assert( isDisplayed, 'The Omnisearch Page is NOT displayed' );
				} );
			} );
		} );
		test.describe( 'Mobile Theme', function() {
			test.it( 'Can open Jetpack Settings and disable/enable the mobile theme', function() {
				this.wpAdminHomePage = new WPAdminHomePage( driver, true );
				this.wpAdminSidebar = new WPAdminSidebar( driver );
				this.wpAdminSidebar.selectJetpackSettings();
				this.jetpackSettingsPage = new WPAdminJetpackSettingsPage( driver );
				this.jetpackSettingsPage.chooseTabNamed( 'Appearance' );
				this.jetpackSettingsPage.enableFeatureNamed( 'Mobile Theme' );
				return this.jetpackSettingsPage.disableFeatureNamed( 'Mobile Theme' );
			} );
		} );
		test.describe( 'Infinite Scroll', function() {
			test.it( 'Can open Jetpack Settings and disable/enable infinite scroll', function() {
				this.wpAdminHomePage = new WPAdminHomePage( driver, true );
				this.wpAdminSidebar = new WPAdminSidebar( driver );
				this.wpAdminSidebar.selectJetpackSettings();
				this.jetpackSettingsPage = new WPAdminJetpackSettingsPage( driver );
				this.jetpackSettingsPage.chooseTabNamed( 'Appearance' );
				this.jetpackSettingsPage.enableFeatureNamed( 'Infinite Scroll' );
				return this.jetpackSettingsPage.disableFeatureNamed( 'Infinite Scroll' );
			} );
		} );
		test.xdescribe( 'Markdown', function() { } );

		test.xdescribe( 'Gravatar Hovercards', function() { } );
		test.xdescribe( 'Custom Content Types', function() { } );
		test.xdescribe( 'Beautiful Math', function() { } );
		test.xdescribe( 'Shortcode Embeds', function() { } );
		test.xdescribe( 'Site Verification', function() { } );
		test.xdescribe( 'Sitemaps', function() { } );
		test.xdescribe( 'WP.me shortlinks', function() { } );
		test.xdescribe( 'VideoPress', function() { } );
		test.xdescribe( 'Spelling & Grammar', function() { } );
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
