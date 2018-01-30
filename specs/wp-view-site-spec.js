import assert from 'assert';
import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper';
import * as eyesHelper from '../lib/eyes-helper.js';

import SidebarComponent from '../lib/components/sidebar-component.js';
import SiteViewComponent from '../lib/components/site-view-component.js';
import LoginFlow from '../lib/flows/login-flow.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();
const httpsHost = config.get( 'httpsHosts' ).indexOf( host ) !== -1;

var driver;

let eyes = eyesHelper.eyesSetup( true );

if ( httpsHost ) {
	test.before( function() {
		this.timeout( startBrowserTimeoutMS );
		driver = driverManager.startBrowser();
	} );

	test.describe( `[${host}] View site from sidebar: (${screenSize}) @parallel @jetpack @visdiff`, function() {
		this.timeout( mochaTimeOut );
		this.bailSuite( true );

		test.describe( 'View site and close:', function() {
			test.before( function() {
				driverManager.clearCookiesAndDeleteLocalStorage( driver );

				let testEnvironment = 'WordPress.com';
				let testName = `My Sites [${global.browserName}] [${screenSize}]`;
				eyesHelper.eyesOpen( driver, eyes, testEnvironment, testName );
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

			test.it( 'Can see the web preview "open in new window" button', function() {
				return this.siteViewComponent.isOpenInNewWindowButtonPresent().then( ( present ) => {
					assert.equal( present, true, 'The web preview "open in new window" button was not displayed' );
				} );
			} );

			test.it( 'Can see the site preview', function() {
				return this.siteViewComponent.isSitePresent().then( ( present ) => {
					assert.equal( present, true, 'The web site preview was not displayed' );
				} );
			} );

			if ( screenSize !== 'mobile' ) {
				test.it( 'Can see the Search & Social preview', function() {
					this.siteViewComponent.selectSearchAndSocialPreview();
					eyesHelper.eyesScreenshot( driver, eyes, 'Search And Social Preview' );
				} );
			}

			if ( screenSize === 'mobile' ) {
				test.it( 'Can close site view', function() {
					return this.siteViewComponent.close( driver );
				} );

				test.it( 'Can see sidebar again', function() {
					return this.sidebarComponent.displayed().then( ( displayed ) => {
						assert( displayed, 'The sidebar was not displayed' );
					} );
				} );
			}

			test.after( function() {
				eyesHelper.eyesClose( eyes );
			} );
		} );
	} );
}
