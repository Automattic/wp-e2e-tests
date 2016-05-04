import test from 'selenium-webdriver/testing';
import { assert } from 'chai';

import config from 'config';
import * as driverManager from '../lib/driver-manager.js';

import ThemesPage from '../lib/pages/themes-page.js';
import CustomizerPage from '../lib/pages/customizer-page.js';
import ThemePreviewPage from '../lib/pages/theme-preview-page.js';

import SidebarComponent from '../lib/components/sidebar-component';
import NavbarComponent from '../lib/components/navbar-component';
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
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.before( function() {
		this.themeSearchName = 'twenty';
		this.expectedTheme = 'twentytwelve';

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
		test.before( function() {
			this.themesPage.clickNewThemeMoreButton();
		} );

		test.it( 'should show a menu', function() {
			this.themesPage.popOverMenuDisplayed().then( ( displayed ) => assert( displayed, true, 'Popover menu not displayed' ) );
		} );

		test.describe( 'when Preview is clicked', function() {
			test.before( function() {
				this.themesPage.clickPopoverItem( 'Preview' );
				this.themePreviewPage = new ThemePreviewPage( this.driver );
			} );

			test.it( 'should show a preview when Preview is clicked', function() {
				assert( this.themePreviewPage.foundPage, true, 'Theme preview not found' );
			} );

			test.describe( 'when Try & Customize is clicked', function() {
				test.before( function() {
					this.themePreviewPage.customize();
					this.siteSelector = new SiteSelectorComponent( this.driver );
				} );

				test.it( 'should show the site selector', function() {
					assert( this.siteSelector.foundComponent, true, 'Site selector not found' );
				} );

				test.describe( 'when a site is selected, and Customize is clicked', function() {
					test.before( function() {
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

		test.describe( 'when Activate is clicked', function() {
			test.before( function( done ) {
				this.navBarComponent = new NavbarComponent( this.driver );
				this.navBarComponent.clickMySites(); // This is necessary for mobile views
				this.sidebarComponent.selectSiteSwitcher();
				this.sidebarComponent.selectAllSites();
				this.sidebarComponent.selectThemes();

				this.themesPage = new ThemesPage( this.driver );
				this.themesPage.showOnlyFreeThemes();
				this.themesPage.getFirstThemeName().then( ( name ) => { // Possibly move tracking of theme name to page model
					this.currentThemeName = name;
					this.themesPage.clickNewThemeMoreButton();
					this.themesPage.clickPopoverItem( 'Activate' );
					this.siteSelector = new SiteSelectorComponent( this.driver );
					this.siteSelector.ok();
					done();
				} );
			} );

			test.it( 'should show the site selector', function() {
				assert( this.siteSelector.foundComponent, true, 'Site selector not found' );
			} );

			test.it( 'should show the successful activation dialog', function( done ) {
				const themeDialogComponent = new ThemeDialogComponent( this.driver );
				themeDialogComponent.getThemeName().then( ( name ) => {
					assert.equal( name, this.currentThemeName );
					themeDialogComponent.goBackToThemes();
					done();
				} );
			} );

			test.it( 'should show the correct theme in the current theme bar', function( done ) {
				const currentThemeComponent = new CurrentThemeComponent( this.driver );
				currentThemeComponent.getThemeName().then( ( name ) => {
					assert.equal( name, this.currentThemeName );
					done();
				} );
			} );

			test.it( 'should highlight the current theme as active', function( done ) {
				this.themesPage.getActiveThemeName().then( ( name ) => {
					assert.equal( name, this.currentThemeName );
					done();
				} );
			} );
		} );
	} );
} );
