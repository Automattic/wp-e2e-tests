import test from 'selenium-webdriver/testing';
import config from 'config';

import LoginFlow from '../lib/flows/login-flow.js';

import CommentsPage from '../lib/pages/comments-page.js';
import PagesPage from '../lib/pages/pages-page.js';
import PluginsPage from '../lib/pages/plugins-page.js';
import PostsPage from '../lib/pages/posts-page.js';
import SettingsPage from '../lib/pages/settings-page.js';
import StatsPage from '../lib/pages/stats-page.js';
import NavbarComponent from '../lib/components/navbar-component.js';
import SidebarComponent from '../lib/components/sidebar-component.js';

import * as driverManager from '../lib/driver-manager.js';
import * as eyesHelper from '../lib/eyes-helper.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

let driver;

let eyes = eyesHelper.eyesSetup( true );

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( 'My Sites: (' + screenSize + ') @parallel', function() {
	this.bailSuite( true );
	this.timeout( mochaTimeOut );

	test.before( function() {
		driverManager.clearCookiesAndDeleteLocalStorage( driver );

		let testEnvironment = 'WordPress.com';
		let testName = `My Sites [${global.browserName}] [${screenSize}]`;
		eyesHelper.eyesOpen( driver, eyes, testEnvironment, testName );
	} );

	test.describe( 'Can Log In', function() {
		test.it( 'Can log in', function() {
			this.loginFlow = new LoginFlow( driver );
			this.loginFlow.login();
		} );

		test.describe( 'Navigate through My Sites', function() {
			test.it( 'Can open the My Sites section', function() {
				this.navBarComponent = new NavbarComponent( driver );
				this.navBarComponent.clickMySites();
				this.statsPage = new StatsPage( driver );
				return this.statsPage.waitForPage();
			} );

			test.it( 'Can see the Site Pages list', function() {
				this.sidebarComponent = new SidebarComponent( driver );
				this.sidebarComponent.selectPages();
				this.pagesPage = new PagesPage( driver );
				this.pagesPage.waitForPages();
				eyesHelper.eyesScreenshot( driver, eyes, 'Site Pages' );
			} );

			test.it( 'Can see the Blog Posts list', function() {
				this.sidebarComponent.selectPosts();
				this.postsPage = new PostsPage( driver );
				this.postsPage.waitForPosts();
				eyesHelper.eyesScreenshot( driver, eyes, 'Blog Posts' );
			} );

			test.it( 'Can see the Comments', function() {
				this.sidebarComponent.selectComments();
				this.commentsPage = new CommentsPage( driver );
				this.commentsPage.waitForComments();
				eyesHelper.eyesScreenshot( driver, eyes, 'Comments' );
			} );

			test.it( 'Can see the Plugins', function() {
				this.sidebarComponent.selectPlugins();
				this.pluginsPage = new PluginsPage( driver );
				this.pluginsPage.waitForPage();
				eyesHelper.eyesScreenshot( driver, eyes, 'Plugins' );
			} );

			test.it( 'Can see the General Settings', function() {
				this.sidebarComponent.selectSettings();
				this.settingsPage = new SettingsPage( driver );
				this.settingsPage.waitForPage();
				eyesHelper.eyesScreenshot( driver, eyes, 'General Settings' );
			} );
		} );
	} );

	test.after( function() {
		eyesHelper.eyesClose( eyes );
	} );
} );
