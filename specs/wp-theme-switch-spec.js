/** @format */

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

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;

before( async function() {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] Switching Themes: (${ screenSize })`, function() {
	this.timeout( mochaTimeOut );

	describe( 'Switching Themes @parallel @jetpack', function() {
		step( 'Delete Cookies and Login', async function() {
			await driverManager.ensureNotLoggedIn( driver );
			let loginFlow = new LoginFlow( driver );
			await loginFlow.loginAndSelectThemes();
		} );

		describe( 'Can switch free themes', function() {
			step( 'Can select a different free theme', async function() {
				this.themesPage = await ThemesPage.Expect( driver );
				await this.themesPage.waitUntilThemesLoaded();
				await this.themesPage.showOnlyFreeThemes();
				await this.themesPage.searchFor( 'Twenty F' );
				await this.themesPage.waitForThemeStartingWith( 'Twenty F' );
				return await this.themesPage.selectNewThemeStartingWith( 'Twenty F' );
			} );

			step( 'Can see theme details page and open the live demo', async function() {
				this.themeDetailPage = await ThemeDetailPage.Expect( driver );
				return await this.themeDetailPage.openLiveDemo();
			} );

			step( 'Can activate the theme from the theme preview page', async function() {
				this.themePreviewPage = await ThemePreviewPage.Expect( driver );
				await this.themePreviewPage.activate();
			} );

			step(
				'Can see the theme thanks dialog and go back to the theme details page',
				async function() {
					const themeDialogComponent = await ThemeDialogComponent.Expect( driver );
					await themeDialogComponent.goToThemeDetail();
					this.themeDetailPage = await ThemeDetailPage.Expect( driver );
					let displayed = await this.themeDetailPage.displayed();
					assert.strictEqual(
						displayed,
						true,
						'Could not see the theme detail page after activating a new theme'
					);
				}
			);
		} );
	} );
} );

describe( `[${ host }] Activating Themes: (${ screenSize }) @parallel @jetpack`, function() {
	this.timeout( mochaTimeOut );
	describe( 'Activating Themes:', function() {
		// Ensure logged out
		before( async function() {
			await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'Login', async function() {
			let loginFlow = new LoginFlow( driver );
			return await loginFlow.loginAndSelectMySite();
		} );

		step( 'Can open Themes menu', async function() {
			let sidebarComponent = await SidebarComponent.Expect( driver );
			return await sidebarComponent.selectThemes();
		} );

		describe( 'Can switch free themes', function() {
			step( 'Can activate a different free theme', async function() {
				let themesPage = await ThemesPage.Expect( driver );
				await themesPage.waitUntilThemesLoaded();
				await themesPage.showOnlyFreeThemes();
				await themesPage.searchFor( 'Twenty F' );
				await themesPage.waitForThemeStartingWith( 'Twenty F' );
				await themesPage.clickNewThemeMoreButton();
				let displayed = await themesPage.popOverMenuDisplayed();
				assert( displayed, true, 'Popover menu not displayed' );
				return await themesPage.clickPopoverItem( 'Activate' );
			} );

			step( 'Can see the theme thanks dialog', async function() {
				const themeDialogComponent = await ThemeDialogComponent.Expect( driver );
				await themeDialogComponent.customizeSite();
			} );

			if ( host === 'WPCOM' ) {
				step( 'Can customize the site from the theme thanks dialog', async function() {
					return await CustomizerPage.Expect( driver );
				} );
			} else {
				step( 'Can log in via Jetpack SSO', async function() {
					const wpAdminLogonPage = await WPAdminLogonPage.Expect( driver );
					return await wpAdminLogonPage.logonSSO();
				} );

				step( 'Can customize the site from the theme thanks dialog', async function() {
					await WPAdminCustomizerPage.refreshIfJNError( driver );
					return await WPAdminCustomizerPage.Expect( driver );
				} );
			}
		} );
	} );
} );
