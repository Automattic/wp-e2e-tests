/** @format */

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

test.before( async function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `Calypso Visual Diff (${ screenSize })`, function() {
	this.bailSuite( true );
	this.timeout( mochaTimeOut );

	test.describe( 'Site Pages: @visdiff', function() {
		test.before( async function() {
			await driverManager.clearCookiesAndDeleteLocalStorage( driver );

			let testEnvironment = 'WordPress.com';
			let testName = `Site Pages [${ global.browserName }] [${ screenSize }]`;
			eyesHelper.eyesOpen( driver, eyes, testEnvironment, testName );
		} );

		test.it( 'Log in as visdiff user', async function() {
			let loginFlow = new LoginFlow( driver, 'visdiffUser' );
			return await loginFlow.loginAndSelectMySite();
		} );

		test.it( 'Can open the Site Pages section', async function() {
			this.sidebarComponent = await SidebarComponent.Expect( driver );
			await this.sidebarComponent.ensureSidebarMenuVisible();
			return await this.sidebarComponent.selectPages();
		} );

		test.it( 'Can view the site pages list', async function() {
			this.pagesPage = new PagesPage( driver );
			await this.pagesPage.waitForPages();
			await eyesHelper.eyesScreenshot( driver, eyes, 'Site Pages List' );
		} );

		test.it( 'Can edit a default page', async function() {
			const defaultPageTitle = 'About';
			await this.pagesPage.editPageWithTitle( defaultPageTitle );
			this.editorPage = await EditorPage.Expect( driver );
			await this.editorPage.waitForTitle();
			let titleShown = await this.editorPage.titleShown();
			assert.equal( titleShown, defaultPageTitle, 'The page title shown was unexpected' );
		} );

		test.it( 'Close sidebar for editor screenshot', async function() {
			this.postEditorSidebarComponent = await PostEditorSidebarComponent.Expect( driver );
			await this.postEditorSidebarComponent.hideComponentIfNecessary();
			await eyesHelper.eyesScreenshot( driver, eyes, 'Page Editor' );
		} );

		test.it( 'Open all sidebar sections for screenshot', async function() {
			await this.postEditorSidebarComponent.displayComponentIfNecessary();
			await this.postEditorSidebarComponent.expandMoreOptions();
			await this.postEditorSidebarComponent.expandSharingSection();
			await this.postEditorSidebarComponent.expandPageOptions();
			await this.postEditorSidebarComponent.expandFeaturedImage();
			await this.postEditorSidebarComponent.expandStatusSection();
			await eyesHelper.eyesScreenshot( driver, eyes, 'Page Editor Settings' );
		} );

		test.it( 'Close editor', async function() {
			this.postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
			return await this.postEditorToolbarComponent.closeEditor();
		} );

		test.after( async function() {
			await eyesHelper.eyesClose( eyes );
		} );
	} );

	test.describe( 'Blog Posts: @visdiff', function() {
		test.before( async function() {
			await driverManager.clearCookiesAndDeleteLocalStorage( driver );

			let testEnvironment = 'WordPress.com';
			let testName = `Blog Posts [${ global.browserName }] [${ screenSize }]`;
			eyesHelper.eyesOpen( driver, eyes, testEnvironment, testName );
		} );

		test.it( 'Log in as visdiff user', async function() {
			let loginFlow = new LoginFlow( driver, 'visdiffUser' );
			return await loginFlow.loginAndSelectMySite();
		} );

		test.it( 'Can open the Blog Posts section', async function() {
			this.sidebarComponent = await SidebarComponent.Expect( driver );
			await this.sidebarComponent.ensureSidebarMenuVisible();
			return await this.sidebarComponent.selectPosts();
		} );

		test.it( 'Can view the blog posts list', async function() {
			this.postsPage = await PostsPage.Expect( driver );
			await this.postsPage.waitForPosts();
			await eyesHelper.eyesScreenshot( driver, eyes, 'Blog Posts List' );
		} );

		test.it( 'Can edit the default post', async function() {
			const defaultPostTitle = 'The Journey Begins';
			await this.postsPage.editPostWithTitle( defaultPostTitle );
			this.editorPage = await EditorPage.Expect( driver );
			await this.editorPage.waitForTitle();
			let titleShown = await this.editorPage.titleShown();
			assert.equal( titleShown, defaultPostTitle, 'The post title shown was unexpected' );
		} );

		test.it( 'Can open the editor media modal', async function() {
			await this.editorPage.chooseInsertMediaOption();
			await this.editorPage.selectFirstImage();
			await eyesHelper.eyesScreenshot( driver, eyes, 'Editor Media Modal' );
		} );

		test.it( 'Can edit an image', async function() {
			await this.editorPage.openImageDetails();
			await this.editorPage.selectEditImage();
			await this.editorPage.waitForImageEditor();
			await eyesHelper.eyesScreenshot( driver, eyes, 'Image Editor Media Modal' );
		} );

		test.it( 'Can close image editor and media modal', async function() {
			await this.editorPage.dismissImageEditor();
			await this.editorPage.dismissImageDetails();
			await this.editorPage.dismissMediaModal();
		} );

		test.it( 'Close sidebar for editor screenshot', async function() {
			this.postEditorSidebarComponent = await PostEditorSidebarComponent.Expect( driver );
			await this.postEditorSidebarComponent.hideComponentIfNecessary();
			await eyesHelper.eyesScreenshot( driver, eyes, 'Post Editor' );
		} );

		test.it( 'Open all sidebar sections for screenshot', async function() {
			await this.postEditorSidebarComponent.displayComponentIfNecessary();
			await this.postEditorSidebarComponent.expandMoreOptions();
			await this.postEditorSidebarComponent.expandPostFormat();
			await this.postEditorSidebarComponent.expandSharingSection();
			await this.postEditorSidebarComponent.expandFeaturedImage();
			await this.postEditorSidebarComponent.expandCategoriesAndTags();
			await this.postEditorSidebarComponent.expandStatusSection();
			await eyesHelper.eyesScreenshot( driver, eyes, 'Post Editor Settings' );
		} );

		test.it( 'Close editor', async function() {
			this.postEditorToolbarComponent = await PostEditorToolbarComponent.Expect( driver );
			return await this.postEditorToolbarComponent.closeEditor();
		} );

		test.after( async function() {
			await eyesHelper.eyesClose( eyes );
		} );
	} );

	test.describe( 'Comments: @visdiff', function() {
		test.before( async function() {
			await driverManager.clearCookiesAndDeleteLocalStorage( driver );

			let testEnvironment = 'WordPress.com';
			let testName = `Comments [${ global.browserName }] [${ screenSize }]`;
			eyesHelper.eyesOpen( driver, eyes, testEnvironment, testName );
		} );

		test.it( 'Log in as visdiff user', async function() {
			let loginFlow = new LoginFlow( driver, 'visdiffUser' );
			return await loginFlow.loginAndSelectMySite();
		} );

		test.it( 'Can open the Comments section', async function() {
			this.sidebarComponent = await SidebarComponent.Expect( driver );
			await this.sidebarComponent.ensureSidebarMenuVisible();
			return await this.sidebarComponent.selectComments();
		} );

		test.it( 'Can view the comments list', async function() {
			this.commentsPage = new CommentsPage( driver );
			await this.commentsPage.waitForComments();
			await eyesHelper.eyesScreenshot( driver, eyes, 'Comments List' );
		} );

		test.after( async function() {
			await eyesHelper.eyesClose( eyes );
		} );
	} );
} );
