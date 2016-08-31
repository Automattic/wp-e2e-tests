import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper.js';

import LoginFlow from '../lib/flows/login-flow-mobile.js';
import EditorPage from '../lib/pages/ios/editor-page-ios.js';
import EditorOptionsPage from '../lib/pages/ios/editor-options-page-ios.js';
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

		test.describe( 'Preview and Publish a Public Post', function() {
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

			test.xit( 'Can fill out body', function() { // Temporarily not adding a body to the post pending further troubleshooting
				return this.editorPage.enterContent( blogPostQuote );
			} );

			test.it( 'Can open options screen', function() {
				return this.editorPage.openOptions();
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

			test.it( 'Post exists', function() {
				this.postsList = new PostsListPage( driver );
				return this.postsList.findPost( blogPostTitle, blogTag );
			} );
		} );
	} );
} );
