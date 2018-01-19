import test from 'selenium-webdriver/testing';
import config from 'config';
import assert from 'assert';

import * as driverManager from '../lib/driver-manager.js';

import LoginFlow from '../lib/flows/login-flow.js';

import CustomizerPage from '../lib/pages/customizer-page';
import ThemesPage from '../lib/pages/themes-page.js';
import ThemePreviewPage from '../lib/pages/theme-preview-page.js';
import ThemeDetailPage from '../lib/pages/theme-detail-page.js';
import ThemeDialogComponent from '../lib/components/theme-dialog-component.js';
import SidebarComponent from '../lib/components/sidebar-component';
import WPAdminCustomizerPage from '../lib/pages/wp-admin/wp-admin-customizer-page.js';
import WPAdminLogonPage from '../lib/pages/wp-admin/wp-admin-logon-page.js';
import * as dataHelper from '../lib/data-helper';
import * as eyesHelper from '../lib/eyes-helper';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

var driver;

let eyes = eyesHelper.eyesSetup( true );

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `[${host}] Switching Themes: (${screenSize})`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.before( function() {
		let testEnvironment = 'WordPress.com';
		let testName = `Themes [${global.browserName}] [${screenSize}]`;
		eyesHelper.eyesOpen( driver, eyes, testEnvironment, testName );
	} );

	test.describe( 'Switching Themes @parallel @jetpack @visdiff', function() {
		test.it( 'Delete Cookies and Login', function() {
			driverManager.clearCookiesAndDeleteLocalStorage( driver );
			let loginFlow = new LoginFlow( driver );
			loginFlow.loginAndSelectThemes();
		} );

		test.describe( 'Can switch free themes', function() {
			test.it( 'Can select a different free theme', function() {
				this.themesPage = new ThemesPage( driver );
				eyesHelper.eyesScreenshot( driver, eyes, 'Themes Page' );
				this.themesPage.showOnlyFreeThemes();
				this.themesPage.searchFor( 'Twenty F' );
				this.themesPage.waitForThemeStartingWith( 'Twenty F' );
				return this.themesPage.selectNewThemeStartingWith( 'Twenty F' );
			} );

			test.it( 'Can see theme details page and open the live demo', function() {
				this.themeDetailPage = new ThemeDetailPage( driver );
				return this.themeDetailPage.openLiveDemo();
			} );

			test.it( 'Can activate the theme from the theme preview page', function() {
				this.themePreviewPage = new ThemePreviewPage( driver );
				this.themePreviewPage.activate();
			} );

			test.it( 'Can see the theme thanks dialog and go back to the theme details page', function() {
				this.themeDialogComponent = new ThemeDialogComponent( driver );
				this.themeDialogComponent.goToThemeDetail();
				this.themeDetailPage = new ThemeDetailPage( driver );
				this.themeDetailPage.displayed().then( function( displayed ) {
					eyesHelper.eyesScreenshot( driver, eyes, 'Theme Details Page' );
					assert.equal( displayed, true, 'Could not see the theme detail page after activating a new theme' );
				} );
			} );
		} );
	} );

	test.after( function() {
		eyesHelper.eyesClose( eyes );
	} );
} );

test.describe( `[${host}] Activating Themes: (${screenSize}) @parallel @jetpack @visdiff`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.describe( 'Activating Themes:', function() {
		// Ensure logged out
		test.before( function() {
			driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.it( 'Login', function() {
			let loginFlow = new LoginFlow( driver );
			return loginFlow.loginAndSelectMySite();
		} );

		test.it( 'Can open Themes menu', function() {
			let sidebarComponent = new SidebarComponent( driver );
			return sidebarComponent.selectThemes();
		} );

		test.describe( 'Can switch free themes', function() {
			test.it( 'Can activate a different free theme', function() {
				let themesPage = new ThemesPage( driver );
				themesPage.showOnlyFreeThemes();
				themesPage.searchFor( 'Twenty F' );
				themesPage.waitForThemeStartingWith( 'Twenty F' );
				themesPage.clickNewThemeMoreButton();
				themesPage.popOverMenuDisplayed().then( ( displayed ) => assert( displayed, true, 'Popover menu not displayed' ) );
				return themesPage.clickPopoverItem( 'Activate' );
			} );

			test.it( 'Can see the theme thanks dialog', function() {
				let themeDialogComponent = new ThemeDialogComponent( driver );
				themeDialogComponent.customizeSite();
			} );

			if ( host === 'WPCOM' ) {
				test.it( 'Can customize the site from the theme thanks dialog', function() {
					let customizerPage = new CustomizerPage( driver );
					return customizerPage.displayed().then( ( displayed ) => {
						assert( displayed, 'The customizer page was not displayed' );
					} );
				} );
			} else {
				test.it( 'Can log in via Jetpack SSO', function() {
					let wpAdminLogonPage = new WPAdminLogonPage( driver );
					return wpAdminLogonPage.logonSSO();
				} );

				test.it( 'Can customize the site from the theme thanks dialog', function() {
					let wpAdminCustomizerPage = new WPAdminCustomizerPage( driver );
					return wpAdminCustomizerPage.displayed().then( ( displayed ) => {
						assert( displayed, 'The customizer page was not displayed' );
					} );
				} );
			}
		} );
	} );
} );
