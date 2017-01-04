import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper.js';

import LoginFlow from '../lib/flows/login-flow-mobile.js';
import EditorPage from '../lib/pages/ios/editor-page-ios.js';
import SiteDetailsPage from '../lib/pages/ios/site-details-page-ios.js';
import EditorOptionsPage from '../lib/pages/ios/editor-options-page-ios.js';
import PostPublishedPage from '../lib/pages/ios/post-published-ios.js';
import PostsListPage from '../lib/pages/ios/posts-list-ios.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startAppTimeoutMS = config.get( 'startAppTimeoutMS' );

var driver;

test.before( 'Start App', function() {
	this.timeout( startAppTimeoutMS );
	return driverManager.startApp().then( function() {
		driver = global.__BROWSER__;
	} );
} );

test.describe( 'Editor: Posts (' + process.env.ORIENTATION + '):', function() {
	this.timeout( mochaTimeOut );
	test.describe( 'Public Posts:', function() {
		test.before( 'Restart app', function() {
			return driverManager.resetApp();
		} );

		test.describe( 'Publish a Public Post', function() {
			const blogPostTitle = dataHelper.randomPhrase();
			const blogPostQuote = 'The foolish man seeks happiness in the distance. The wise grows it under his feet.\n— James Oppenheim';
			const blogTag = 'tag-' + new Date().getTime();

			test.it( 'Can log in and open post editor', function() {
				let loginFlow = new LoginFlow( driver );
				return loginFlow.loginAndStartNewPost();
			} );

			test.it( 'Can fill out title', function() {
				this.editorPage = new EditorPage( driver );
				return this.editorPage.enterTitle( blogPostTitle );
			} );

			test.it( 'Can fill out body', function() {
				return this.editorPage.enterContent( blogPostQuote );
			} );

			test.it( 'Can open "more" menu', function() {
				return this.editorPage.openMenu();
			} );

			test.it( 'Can open options page', function() {
				return this.editorPage.selectOption( 'Options' );
			} );

			test.it( 'Can add tag', function() {
				this.editorOptions = new EditorOptionsPage( driver );
				return this.editorOptions.addTag( blogTag );
			} );

			test.it( 'Can return to Editor', function() {
				return this.editorOptions.goBack();
			} );

			test.it( 'Can Post', function() {
				return this.editorPage.clickPost();
			} );

			test.it( 'Post published', function() {
				this.publishConfirmation = new PostPublishedPage( driver );
				return this.publishConfirmation.displayed();
			} );

			test.it( 'Click Done', function() {
				return this.publishConfirmation.clickDone();
			} );

			test.it( 'Returned to site details', function() {
				this.siteDetailsPage = new SiteDetailsPage( driver );
				return this.siteDetailsPage.displayed();
			} );

			test.it( 'Open posts list', function() {
				return this.siteDetailsPage.clickMenuItem( 'Blog Posts' );
			} );

			test.it( 'Search for post', function() {
				this.postsListPage = new PostsListPage( driver );
				return this.postsListPage.findPost( blogPostTitle );
			} );
		} );
	} );
} );
