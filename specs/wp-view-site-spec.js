/** @format */

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

let driver;

let eyes = eyesHelper.eyesSetup( true );

test.before( async function() {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

test.describe(
	`[${ host }] View site from sidebar: (${ screenSize }) @parallel @jetpack @visdiff`,
	function() {
		this.timeout( mochaTimeOut );
		this.bailSuite( true );

		test.describe( 'View site and close:', function() {
			test.before( async function() {
				await driverManager.clearCookiesAndDeleteLocalStorage( driver );

				let testEnvironment = 'WordPress.com';
				let testName = `My Sites [${ global.browserName }] [${ screenSize }]`;
				eyesHelper.eyesOpen( driver, eyes, testEnvironment, testName );
			} );

			test.it( 'Can Log In and go to My Sites', async function() {
				const loginFlow = await new LoginFlow( driver );
				return await loginFlow.loginAndSelectMySite();
			} );

			test.it( 'Can view the default site from sidebar', async function() {
				this.sidebarComponent = await new SidebarComponent( driver );
				return await this.sidebarComponent.selectViewThisSite();
			} );

			test.it( 'Can see the web preview button', async function() {
				this.siteViewComponent = await new SiteViewComponent( driver );
				let present = await this.siteViewComponent.isWebPreviewPresent();
				return assert.equal( present, true, 'The web preview button was not displayed' );
			} );

			test.it( 'Can see the web preview "open in new window" button', async function() {
				let present = await this.siteViewComponent.isOpenInNewWindowButtonPresent();
				return assert.equal(
					present,
					true,
					'The web preview "open in new window" button was not displayed'
				);
			} );

			test.it( 'Can see the site preview', async function() {
				let present = await this.siteViewComponent.isSitePresent();
				return assert.equal( present, true, 'The web site preview was not displayed' );
			} );

			if ( screenSize !== 'mobile' ) {
				test.it( 'Can see the Search & Social preview', async function() {
					await this.siteViewComponent.selectSearchAndSocialPreview();
					await eyesHelper.eyesScreenshot( driver, eyes, 'Search And Social Preview' );
				} );
			}

			if ( screenSize === 'mobile' ) {
				test.it( 'Can close site view', async function() {
					return await this.siteViewComponent.close( driver );
				} );

				test.it( 'Can see sidebar again', async function() {
					let displayed = await this.sidebarComponent.displayed();
					return assert( displayed, 'The sidebar was not displayed' );
				} );
			}

			test.after( async function() {
				await eyesHelper.eyesClose( eyes );
			} );
		} );
	}
);
