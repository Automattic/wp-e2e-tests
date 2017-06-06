import assert from 'assert';
import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager.js';

import SidebarComponent from '../lib/components/sidebar-component.js';
import SiteViewComponent from '../lib/components/site-view-component.js';
import LoginFlow from '../lib/flows/login-flow.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

var driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( 'View site from sidebar: (' + screenSize + ') @parallel @jetpack', function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.describe( 'View site and close:', function() {
		test.before( function() {
			driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.it( 'Can Log In and go to My Sites', function() {
			const loginFlow = new LoginFlow( driver );
			return loginFlow.loginAndSelectMySite();
		} );

		test.it( 'Can view the default site from sidebar', function() {
			this.sidebarComponent = new SidebarComponent( driver );
			return this.sidebarComponent.selectViewThisSite();
		} );

		test.it( 'Can see the web preview button', function() {
			this.siteViewComponent = new SiteViewComponent( driver );
			return this.siteViewComponent.isWebPreviewPresent().then( ( present ) => {
				assert.equal( present, true, 'The web preview button was not displayed' );
			} );
		} );

		test.it( 'Can see the web preview SEO label', function() {
			return this.siteViewComponent.isSeoPresent().then( ( present ) => {
				assert.equal( present, true, 'The web preview SEO label was not displayed' );
			} );
		} );

		test.it( 'Can see the site preview', function() {
			return this.siteViewComponent.isSitePresent().then( ( present ) => {
				assert.equal( present, true, 'The web site preview was not displayed' );
			} );
		} );

		test.it( 'Can close site view', function() {
			return this.siteViewComponent.close( driver );
		} );

		test.it( 'Can see sidebar again', function() {
			return this.sidebarComponent.displayed().then( ( displayed ) => {
				assert( displayed, 'The sidebar was not displayed' );
			} );
		} );
	} );
} );
