import assert from 'assert';
import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager.js';

import MySitePage from '../lib/pages/mysite-page';
import SidebarComponent from '../lib/components/sidebar-component.js';
import LoginFlow from '../lib/flows/login-flow.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

var driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( 'View site from sidebar: (' + screenSize + ')', function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.describe( 'View site and close:', function() {
		test.before( function() {
			driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.it( 'Can Log In and go to My Sites', function() {
			const loginFlow = new LoginFlow( driver );
			loginFlow.loginAndSelectMySite();
		} );

		test.it( 'Can view the default site from sidebar', function() {
			this.sidebarComponent = new SidebarComponent( driver );
			this.sidebarComponent.selectViewThisSite();
		} );

		test.it( 'Can see the web preview button', function() {
			this.mySitePage = new MySitePage( driver );
			return this.mySitePage.isWebPreviewPresent().then( ( present ) => {
				assert.equal( present, true, 'The web preview button was not displayed' );
			} );
		} );

		test.it( 'Can see the web preview SEO label', function() {
			return this.mySitePage.isSeoPresent().then( ( present ) => {
				assert.equal( present, true, 'The web preview SEO label was not displayed' );
			} );
		} );

		test.it( 'Can see the site preview', function() {
			return this.mySitePage.isSitePresent().then( ( present ) => {
				assert.equal( present, true, 'The web site preview was not displayed' );
			} );
		} );

		test.it( 'Can close site view', function() {
			this.mySitePage.closeSite( driver );
		} );

		test.it( 'Can see sidebar again', function() {
			return this.sidebarComponent.displayed().then( ( displayed ) => {
				assert( displayed, 'The sidebar was not displayed' );
			} );
		} );
	} );

} );
