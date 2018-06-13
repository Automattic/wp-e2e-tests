/** @format */

import test from 'selenium-webdriver/testing';
import { assert } from 'chai';

import config from 'config';
import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper';

import ThemeDetailPage from '../lib/pages/theme-detail-page.js';
import ThemesPage from '../lib/pages/themes-page.js';
import CustomizerPage from '../lib/pages/customizer-page.js';

import SidebarComponent from '../lib/components/sidebar-component';
import SiteSelectorComponent from '../lib/components/site-selector-component';
import ThemeDialogComponent from '../lib/components/theme-dialog-component';
import CurrentThemeComponent from '../lib/components/current-theme-component';

import LoginFlow from '../lib/flows/login-flow.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;

test.before( async function() {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

test.describe( `[${ host }] Themes: All sites (${ screenSize })`, function() {
	test.describe( 'Preview a theme @parallel', function() {
		this.bailSuite( true );
		this.timeout( mochaTimeOut );

		test.it( 'Login and select themes', async function() {
			this.themeSearchName = 'twenty';
			this.expectedTheme = 'Twenty F';

			await driverManager.clearCookiesAndDeleteLocalStorage( driver );

			this.loginFlow = new LoginFlow( driver, 'multiSiteUser' );
			await this.loginFlow.loginAndSelectAllSites();

			this.sidebarComponent = new SidebarComponent( driver );
			await this.sidebarComponent.selectThemes();
		} );

		test.it( 'can search for free themes', async function() {
			this.themesPage = await ThemesPage.Expect( driver );
			await this.themesPage.waitUntilThemesLoaded();
			await this.themesPage.showOnlyFreeThemes();
			await this.themesPage.searchFor( this.themeSearchName );

			await this.themesPage.waitForThemeStartingWith( this.expectedTheme );
		} );

		test.describe( 'when a theme more button is clicked', function() {
			test.it( 'click theme more button', async function() {
				await this.themesPage.clickNewThemeMoreButton();
			} );

			test.it( 'should show a menu', async function() {
				let displayed = await this.themesPage.popOverMenuDisplayed();
				assert( displayed, true, 'Popover menu not displayed' );
			} );

			test.describe( 'when "Try & Customize" is clicked', function() {
				test.it( 'click try and customize popover', async function() {
					await this.themesPage.clickPopoverItem( 'Try & Customize' );
					this.siteSelector = new SiteSelectorComponent( driver );
				} );

				test.it( 'should show the site selector', async function() {
					let siteSelectorShown = await this.siteSelector.displayed();
					return assert.equal( siteSelectorShown, true, 'The site selector was not shown' );
				} );

				test.describe( 'when a site is selected, and Customize is clicked', function() {
					test.it( 'select first site', async function() {
						await this.siteSelector.selectFirstSite();
						await this.siteSelector.ok();
					} );

					test.it( 'should open the customizer with the selected site and theme', async function(
						done
					) {
						this.customizerPage = new CustomizerPage( driver );
						let url = await driver.getCurrentUrl();
						assert.include( url, this.siteSelector.selectedSiteDomain, 'Wrong site domain' );
						assert.include( url, this.themeSearchName, 'Wrong theme' );
						done();
					} );

					test.after( async function() {
						await this.customizerPage.close();
					} );
				} );
			} );
		} );
	} );

	test.describe( 'Activate a theme @parallel', function() {
		this.bailSuite( true );
		this.timeout( mochaTimeOut );

		test.it( 'Login and select themes', async function() {
			this.themeSearchName = 'twenty';
			this.expectedTheme = 'Twenty F';

			await driverManager.clearCookiesAndDeleteLocalStorage( driver );

			this.loginFlow = new LoginFlow( driver, 'multiSiteUser' );
			await this.loginFlow.loginAndSelectAllSites();

			this.sidebarComponent = new SidebarComponent( driver );
			await this.sidebarComponent.selectThemes();
		} );

		test.it( 'can search for free themes', async function() {
			this.themesPage = await ThemesPage.Expect( driver );
			await this.themesPage.waitUntilThemesLoaded();
			await this.themesPage.showOnlyFreeThemes();
			await this.themesPage.searchFor( this.themeSearchName );
			await this.themesPage.waitForThemeStartingWith( this.expectedTheme );

			this.currentThemeName = await this.themesPage.getFirstThemeName();
		} );

		test.describe( 'when a theme more button is clicked', function() {
			test.it( 'click new theme more button', async function() {
				await this.themesPage.clickNewThemeMoreButton();
			} );

			test.it( 'should show a menu', async function() {
				let displayed = await this.themesPage.popOverMenuDisplayed();
				assert( displayed, true, 'Popover menu not displayed' );
			} );

			test.describe( 'when Activate is clicked', function() {
				test.it( 'can click activate', async function() {
					await this.themesPage.clickPopoverItem( 'Activate' );
					return ( this.siteSelector = new SiteSelectorComponent( driver ) );
				} );

				test.it( 'shows the site selector', async function() {
					let siteSelectorShown = await this.siteSelector.displayed();
					return assert.equal( siteSelectorShown, true, 'The site selector was not shown' );
				} );

				test.it( 'can select the first site sites', async function() {
					await this.siteSelector.selectFirstSite();
					return await this.siteSelector.ok();
				} );

				test.describe( 'Successful activation dialog', function() {
					test.it( 'should show the successful activation dialog', async function() {
						const themeDialogComponent = new ThemeDialogComponent( driver );
						return await themeDialogComponent.goToThemeDetail();
					} );

					test.it( 'should show the correct theme in the current theme bar', async function() {
						this.themeDetailPage = await ThemeDetailPage.Expect( driver );
						await this.themeDetailPage.goBackToAllThemes();
						this.currentThemeComponent = new CurrentThemeComponent( driver );
						let name = await this.currentThemeComponent.getThemeName();
						return assert.equal( name, this.currentThemeName );
					} );

					test.it( 'should highlight the current theme as active', async function() {
						await this.themesPage.showOnlyFreeThemes();
						await this.themesPage.searchFor( this.themeSearchName );
						let name = await this.themesPage.getActiveThemeName();
						return assert.equal( name, this.currentThemeName );
					} );
				} );
			} );
		} );
	} );
} );
