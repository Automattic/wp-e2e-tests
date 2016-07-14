import test from 'selenium-webdriver/testing';
import { assert } from 'chai';

import config from 'config';
import * as driverManager from '../lib/driver-manager.js';

import ThemesPage from '../lib/pages/themes-page.js';
import CustomizerPage from '../lib/pages/customizer-page.js';
import ThemePreviewPage from '../lib/pages/theme-preview-page.js';

import SidebarComponent from '../lib/components/sidebar-component';
import SiteSelectorComponent from '../lib/components/site-selector-component';
import ThemeDialogComponent from '../lib/components/theme-dialog-component';
import CurrentThemeComponent from '../lib/components/current-theme-component';

import LoginFlow from '../lib/flows/login-flow.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	this.driver = driverManager.startBrowser();
} );

test.describe( 'Themes: All sites (' + screenSize + ')', function() {

	test.describe( 'Preview a theme', function() {
		this.bailSuite( true );
		this.timeout( mochaTimeOut );

		test.it( 'Login and select themes', function() {
			this.themeSearchName = 'twenty';
			this.expectedTheme = 'Twenty F';

			driverManager.clearCookiesAndDeleteLocalStorage( this.driver );

			this.loginFlow = new LoginFlow( this.driver, 'multiSiteUser' );
			this.loginFlow.loginAndSelectAllSites();

			this.sidebarComponent = new SidebarComponent( this.driver );
			this.sidebarComponent.selectThemes();
		} );

		test.it( 'can search for free themes', function() {
			this.themesPage = new ThemesPage( this.driver );
			this.themesPage.showOnlyFreeThemes();
			this.themesPage.searchFor( this.themeSearchName );

			this.themesPage.waitForThemeStartingWith( this.expectedTheme );
		} );

		test.describe( 'when a theme more button is clicked', function() {
			test.it( 'click theme more button', function() {
				this.themesPage.clickNewThemeMoreButton();
			} );

			test.it( 'should show a menu', function() {
				this.themesPage.popOverMenuDisplayed().then( ( displayed ) => assert( displayed, true, 'Popover menu not displayed' ) );
			} );

			test.describe( 'when "Live demo" is clicked', function() {
				test.it( 'click live demo popover', function() {
					this.themesPage.clickPopoverItem( 'Live demo' );
					this.themePreviewPage = new ThemePreviewPage( this.driver );
				} );

				test.it( 'should show a preview when Preview is clicked', function() {
					this.themePreviewPage.displayed().then( ( displayed ) => {
						assert( displayed, 'Theme preview not found' );
					} );
				} );

				test.describe( 'when Try & Customize is clicked', function() {
					test.it( 'choose customize', function() {
						this.themePreviewPage.customize();
						this.siteSelector = new SiteSelectorComponent( this.driver );
					} );

					test.it( 'should show the site selector', function() {
						return this.siteSelector.displayed().then( function( siteSelectorShown ) {
							return assert.equal( siteSelectorShown, true, 'The site selector was not shown' );
						} );
					} );

					test.describe( 'when a site is selected, and Customize is clicked', function() {
						test.it( 'select first site', function() {
							this.siteSelector.selectFirstSite();
							this.siteSelector.ok();
						} );

						test.it( 'should open the customizer with the selected site and theme', function( done ) {
							this.customizerPage = new CustomizerPage( this.driver );
							this.driver.getCurrentUrl().then( ( url ) => {
								assert.include( url, this.siteSelector.selectedSiteDomain, 'Wrong site domain' );
								assert.include( url, this.themeSearchName, 'Wrong theme' );
								done();
							} );
						} );

						test.after( function() {
							this.customizerPage.close();
						} );
					} );
				} )
			} );
		} );
	} );

	test.describe( 'Activate a theme', function() {
		this.bailSuite( true );
		this.timeout( mochaTimeOut );

		test.it( 'Login and select themes', function() {
			this.themeSearchName = 'twenty';
			this.expectedTheme = 'Twenty F';

			driverManager.clearCookiesAndDeleteLocalStorage( this.driver );

			this.loginFlow = new LoginFlow( this.driver, 'multiSiteUser' );
			this.loginFlow.loginAndSelectAllSites();

			this.sidebarComponent = new SidebarComponent( this.driver );
			this.sidebarComponent.selectThemes();
		} );

		test.it( 'can search for free themes', function() {
			this.themesPage = new ThemesPage( this.driver );
			this.themesPage.showOnlyFreeThemes();
			this.themesPage.searchFor( this.themeSearchName );

			this.themesPage.waitForThemeStartingWith( this.expectedTheme );

			this.themesPage.getFirstThemeName().then( ( name ) => {
				this.currentThemeName = name;
			} );
		} );

		test.describe( 'when a theme more button is clicked', function() {
			test.it( 'click new theme more button', function() {
				this.themesPage.clickNewThemeMoreButton();
			} );

			test.it( 'should show a menu', function() {
				this.themesPage.popOverMenuDisplayed().then( ( displayed ) => assert( displayed, true, 'Popover menu not displayed' ) );
			} );

			test.describe( 'when Activate is clicked', function() {
				test.it( 'can click activate', function() {
					this.themesPage.clickPopoverItem( 'Activate' );
					return this.siteSelector = new SiteSelectorComponent( this.driver );
				} );

				test.it( 'shows the site selector', function() {
					return this.siteSelector.displayed().then( function( siteSelectorShown ) {
						return assert.equal( siteSelectorShown, true, 'The site selector was not shown' );
					} );
				} );

				test.it( 'can select the first site sites', function() {
					this.siteSelector.selectFirstSite();
					return this.siteSelector.ok();
				} );

				test.describe( 'Successful activation dialog', function() {
					test.it( 'should show the successful activation dialog', function() {
						const themeDialogComponent = new ThemeDialogComponent( this.driver );
						return themeDialogComponent.goBackToThemes();
					} );

					test.it( 'should show the correct theme in the current theme bar', function() {
						this.currentThemeComponent = new CurrentThemeComponent( this.driver );
						return this.currentThemeComponent.getThemeName().then( ( name ) => {
							return assert.equal( name, this.currentThemeName );
						} );
					} );

					test.it( 'should highlight the current theme as active', function() {
						this.themesPage.showOnlyFreeThemes();
						this.themesPage.searchFor( this.themeSearchName );
						return this.themesPage.getActiveThemeName().then( ( name ) => {
							return assert.equal( name, this.currentThemeName );
						} );
					} );
				} );
			} );
		} );
	} );
} );
