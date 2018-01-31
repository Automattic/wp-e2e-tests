import assert from 'assert';
import config from 'config';
import test from 'selenium-webdriver/testing';

import * as driverManager from '../lib/driver-manager.js';
import * as eyesHelper from '../lib/eyes-helper';

import LoginFlow from '../lib/flows/login-flow.js';

import PostEditorSidebarComponent from '../lib/components/post-editor-sidebar-component.js';
import PostEditorToolbarComponent from '../lib/components/post-editor-toolbar-component.js';
import SidebarComponent from '../lib/components/sidebar-component.js';

import CommentsPage from '../lib/pages/comments-page.js';
import EditorPage from '../lib/pages/editor-page.js';
import PagesPage from '../lib/pages/pages-page.js';
import PostsPage from '../lib/pages/posts-page.js';

let driver;
const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

const eyes = eyesHelper.eyesSetup( true );

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `Calypso Visual Diff (${screenSize})`, function() {
	this.bailSuite( true );
	this.timeout( mochaTimeOut );

	test.describe( 'Site Pages: @visdiff', function() {
		test.before( function() {
			driverManager.clearCookiesAndDeleteLocalStorage( driver );

			let testEnvironment = 'WordPress.com';
			let testName = `Site Pages [${global.browserName}] [${screenSize}]`;
			eyesHelper.eyesOpen( driver, eyes, testEnvironment, testName );
		} );

		test.it( 'Log in as visdiff user', function() {
			let loginFlow = new LoginFlow( driver, 'visdiffUser' );
			return loginFlow.loginAndSelectMySite();
		} );

		test.it( 'Can open the Site Pages section', function() {
			this.sidebarComponent = new SidebarComponent( driver );
			this.sidebarComponent.ensureSidebarMenuVisible();
			return this.sidebarComponent.selectPages();
		} );

		test.it( 'Can view the site pages list', function() {
			this.pagesPage = new PagesPage( driver );
			this.pagesPage.waitForPages();
			eyesHelper.eyesScreenshot( driver, eyes, 'Site Pages List' );
		} );

		test.it( 'Can edit a default page', function() {
			const defaultPageTitle = 'About';
			this.pagesPage.editPageWithTitle( defaultPageTitle );
			this.editorPage = new EditorPage( driver );
			this.editorPage.waitForTitle();
			this.editorPage.titleShown().then( ( titleShown ) => {
				assert.equal( titleShown, defaultPageTitle, 'The page title shown was unexpected' );
			} );
		} );

		test.it( 'Close sidebar for editor screenshot', function() {
			this.postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
			this.postEditorSidebarComponent.hideComponentIfNecessary();
			eyesHelper.eyesScreenshot( driver, eyes, 'Page Editor' );
		} );

		test.it( 'Open all sidebar sections for screenshot', function() {
			this.postEditorSidebarComponent.displayComponentIfNecessary();
			this.postEditorSidebarComponent.expandMoreOptions();
			this.postEditorSidebarComponent.expandSharingSection();
			this.postEditorSidebarComponent.expandPageOptions();
			this.postEditorSidebarComponent.expandFeaturedImage();
			this.postEditorSidebarComponent.expandStatusSection();
			eyesHelper.eyesScreenshot( driver, eyes, 'Page Editor Settings' );
		} );

		test.it( 'Close editor', function() {
			this.postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
			return this.postEditorToolbarComponent.closeEditor();
		} );

		test.after( function() {
			eyesHelper.eyesClose( eyes );
		} );
	} );

	test.describe( 'Blog Posts: @visdiff', function() {
		test.before( function() {
			driverManager.clearCookiesAndDeleteLocalStorage( driver );

			let testEnvironment = 'WordPress.com';
			let testName = `Blog Posts [${global.browserName}] [${screenSize}]`;
			eyesHelper.eyesOpen( driver, eyes, testEnvironment, testName );
		} );

		test.it( 'Log in as visdiff user', function() {
			let loginFlow = new LoginFlow( driver, 'visdiffUser' );
			return loginFlow.loginAndSelectMySite();
		} );

		test.it( 'Can open the Blog Posts section', function() {
			this.sidebarComponent = new SidebarComponent( driver );
			this.sidebarComponent.ensureSidebarMenuVisible();
			return this.sidebarComponent.selectPosts();
		} );

		test.it( 'Can view the blog posts list', function() {
			this.postsPage = new PostsPage( driver );
			this.postsPage.waitForPosts();
			eyesHelper.eyesScreenshot( driver, eyes, 'Blog Posts List' );
		} );

		test.it( 'Can edit the default post', function() {
			const defaultPostTitle = 'The Journey Begins';
			this.postsPage.editPostWithTitle( defaultPostTitle );
			this.editorPage = new EditorPage( driver );
			this.editorPage.waitForTitle();
			this.editorPage.titleShown().then( ( titleShown ) => {
				assert.equal( titleShown, defaultPostTitle, 'The post title shown was unexpected' );
			} );
		} );

		test.it( 'Can open the editor media modal', function() {
			this.editorPage.chooseInsertMediaOption();
			this.editorPage.selectImageByNumber( 0 ).then( () => {
				eyesHelper.eyesScreenshot( driver, eyes, 'Editor Media Modal' );
			} );
		} );

		test.it( 'Can edit an image', function() {
			this.editorPage.openImageDetails();
			this.editorPage.selectEditImage();
			this.editorPage.waitForImageEditor();
			eyesHelper.eyesScreenshot( driver, eyes, 'Image Editor Media Modal' );
		} );

		test.it( 'Can close image editor and media modal', function() {
			this.editorPage.dismissImageEditor();
			this.editorPage.dismissImageDetails();
			this.editorPage.dismissMediaModal();
		} );

		test.it( 'Close sidebar for editor screenshot', function() {
			this.postEditorSidebarComponent = new PostEditorSidebarComponent( driver );
			this.postEditorSidebarComponent.hideComponentIfNecessary().then( () => {
				eyesHelper.eyesScreenshot( driver, eyes, 'Post Editor' );
			} );
		} );

		test.it( 'Open all sidebar sections for screenshot', function() {
			this.postEditorSidebarComponent.displayComponentIfNecessary();
			this.postEditorSidebarComponent.expandMoreOptions();
			this.postEditorSidebarComponent.expandPostFormat();
			this.postEditorSidebarComponent.expandSharingSection();
			this.postEditorSidebarComponent.expandFeaturedImage();
			this.postEditorSidebarComponent.expandCategoriesAndTags();
			this.postEditorSidebarComponent.expandStatusSection();
			eyesHelper.eyesScreenshot( driver, eyes, 'Post Editor Settings' );
		} );

		test.it( 'Close editor', function() {
			this.postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
			return this.postEditorToolbarComponent.closeEditor();
		} );

		test.after( function() {
			eyesHelper.eyesClose( eyes );
		} );
	} );

	test.describe( 'Comments: @visdiff', function() {
		test.before( function() {
			driverManager.clearCookiesAndDeleteLocalStorage( driver );

			let testEnvironment = 'WordPress.com';
			let testName = `Comments [${global.browserName}] [${screenSize}]`;
			eyesHelper.eyesOpen( driver, eyes, testEnvironment, testName );
		} );

		test.it( 'Log in as visdiff user', function() {
			let loginFlow = new LoginFlow( driver, 'visdiffUser' );
			return loginFlow.loginAndSelectMySite();
		} );

		test.it( 'Can open the Comments section', function() {
			this.sidebarComponent = new SidebarComponent( driver );
			this.sidebarComponent.ensureSidebarMenuVisible();
			return this.sidebarComponent.selectComments();
		} );

		test.it( 'Can view the comments list', function() {
			this.commentsPage = new CommentsPage( driver );
			this.commentsPage.waitForComments();
			eyesHelper.eyesScreenshot( driver, eyes, 'Comments List' );
		} );

		test.after( function() {
			eyesHelper.eyesClose( eyes );
		} );
	} );
} );
