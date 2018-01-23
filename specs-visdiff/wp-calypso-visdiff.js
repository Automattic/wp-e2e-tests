import config from 'config';
import test from 'selenium-webdriver/testing';
import * as driverManager from '../lib/driver-manager.js';
import * as eyesHelper from '../lib/eyes-helper';

import LoginFlow from '../lib/flows/login-flow.js';

import SidebarComponent from '../lib/components/sidebar-component.js';

import PagesPage from '../lib/pages/pages-page.js';
import PostsPage from '../lib/pages/posts-page.js';

let driver;
const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

const eyes = eyesHelper.eyesSetup( true );
const testEnvironment = 'WordPress.com';

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `Calypso Visual Diff (${screenSize}) @visdiff`, function() {
	this.timeout( mochaTimeOut );

	test.beforeEach( function() {
		driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	test.describe( 'My Sites:', function() {
		test.before( function() {
			let testName = `My Sites [${global.browserName}] [${screenSize}]`;
			eyesHelper.eyesOpen( driver, eyes, testEnvironment, testName );
		} );

		test.it( 'Log in as visdiff user', function() {
			let loginFlow = new LoginFlow( driver, 'visdiffUser' );
			return loginFlow.loginAndSelectMySite();
		} );

		test.describe( 'Site Pages', function() {
			test.it( 'Can view the site pages list', function() {
				let sidebarComponent = new SidebarComponent( driver );
				sidebarComponent.selectPages();
				let pagesPage = new PagesPage( driver );
				pagesPage.waitForPages();
				eyesHelper.eyesScreenshot( driver, eyes, 'Site Pages List' );
			} );
		} );

		test.describe( 'Blog Posts', function() {
			test.it( 'Can view the blog posts list', function() {
				let sidebarComponent = new SidebarComponent( driver );
				sidebarComponent.ensureSidebarMenuVisible();
				sidebarComponent.selectPosts();
				let postsPage = new PostsPage( driver );
				postsPage.waitForPosts();
				eyesHelper.eyesScreenshot( driver, eyes, 'Blog Posts List' );
			} );
		} );

		test.after( function() {
			eyesHelper.eyesClose( eyes );
		} );
	} );
} );

test.after( function() {
	if ( ! process.env.EYESDEBUG ) {
		eyes.abortIfNotClosed();
	}
} );
