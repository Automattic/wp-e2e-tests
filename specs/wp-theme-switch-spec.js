/** @format */

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

let driver;

let eyes = eyesHelper.eyesSetup( false );

test.before( async function() {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

test.describe( `[${ host }] Switching Themes: (${ screenSize })`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.before( function() {
		let testEnvironment = 'WordPress.com';
		let testName = `Themes [${ global.browserName }] [${ screenSize }]`;
		eyesHelper.eyesOpen( driver, eyes, testEnvironment, testName );
	} );

	test.describe( 'Switching Themes @parallel @jetpack @visdiff', function() {
		test.it( 'Delete Cookies and Login', async function() {
			await driverManager.clearCookiesAndDeleteLocalStorage( driver );
			let loginFlow = new LoginFlow( driver );
			await loginFlow.loginAndSelectThemes();
		} );

		test.describe( 'Can switch free themes', function() {
			test.it( 'Can select a different free theme', async function() {
				this.themesPage = new ThemesPage( driver );
				await eyesHelper.eyesScreenshot( driver, eyes, 'Themes Page' );
				await this.themesPage.showOnlyFreeThemes();
				await this.themesPage.searchFor( 'Twenty F' );
				await this.themesPage.waitForThemeStartingWith( 'Twenty F' );
				return await this.themesPage.selectNewThemeStartingWith( 'Twenty F' );
			} );

			test.it( 'Can see theme details page and open the live demo', async function() {
				this.themeDetailPage = new ThemeDetailPage( driver );
				return await this.themeDetailPage.openLiveDemo();
			} );

			test.it( 'Can activate the theme from the theme preview page', async function() {
				this.themePreviewPage = new ThemePreviewPage( driver );
				await this.themePreviewPage.activate();
			} );

			test.it(
				'Can see the theme thanks dialog and go back to the theme details page',
				async function() {
					this.themeDialogComponent = new ThemeDialogComponent( driver );
					await this.themeDialogComponent.goToThemeDetail();
					this.themeDetailPage = new ThemeDetailPage( driver );
					let displayed = await this.themeDetailPage.displayed();
					await eyesHelper.eyesScreenshot( driver, eyes, 'Theme Details Page' );
					assert.equal(
						displayed,
						true,
						'Could not see the theme detail page after activating a new theme'
					);
				}
			);
		} );
	} );

	test.after( async function() {
		await eyesHelper.eyesClose( eyes );
	} );
} );

test.describe(
	`[${ host }] Activating Themes: (${ screenSize }) @parallel @jetpack @visdiff`,
	function() {
		this.timeout( mochaTimeOut );
		this.bailSuite( true );

		test.describe( 'Activating Themes:', function() {
			// Ensure logged out
			test.before( async function() {
				await driverManager.clearCookiesAndDeleteLocalStorage( driver );
			} );

			test.it( 'Login', async function() {
				let loginFlow = new LoginFlow( driver );
				return await loginFlow.loginAndSelectMySite();
			} );

			test.it( 'Can open Themes menu', async function() {
				let sidebarComponent = new SidebarComponent( driver );
				return await sidebarComponent.selectThemes();
			} );

			test.describe( 'Can switch free themes', function() {
				test.it( 'Can activate a different free theme', async function() {
					let themesPage = new ThemesPage( driver );
					await themesPage.showOnlyFreeThemes();
					await themesPage.searchFor( 'Twenty F' );
					await themesPage.waitForThemeStartingWith( 'Twenty F' );
					await themesPage.clickNewThemeMoreButton();
					let displayed = await themesPage.popOverMenuDisplayed();
					assert( displayed, true, 'Popover menu not displayed' );
					return await themesPage.clickPopoverItem( 'Activate' );
				} );

				test.it( 'Can see the theme thanks dialog', async function() {
					let themeDialogComponent = new ThemeDialogComponent( driver );
					await themeDialogComponent.customizeSite();
				} );

				if ( host === 'WPCOM' ) {
					test.it( 'Can customize the site from the theme thanks dialog', async function() {
						let customizerPage = new CustomizerPage( driver );
						let displayed = await customizerPage.displayed();
						return assert( displayed, 'The customizer page was not displayed' );
					} );
				} else {
					test.it( 'Can log in via Jetpack SSO', async function() {
						const wpAdminLogonPage = await WPAdminLogonPage.Expect( driver );
						return await wpAdminLogonPage.logonSSO();
					} );

					test.it( 'Can customize the site from the theme thanks dialog', async function() {
						let wpAdminCustomizerPage = new WPAdminCustomizerPage( driver );
						let displayed = await wpAdminCustomizerPage.displayed();
						assert( displayed, 'The customizer page was not displayed' );
					} );
				}
			} );
		} );
	}
);
