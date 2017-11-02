import test from 'selenium-webdriver/testing';
import config from 'config';
import assert from 'assert';

import * as driverManager from '../lib/driver-manager.js';

import LoginFlow from '../lib/flows/login-flow.js';

import ReaderPage from '../lib/pages/reader-page';
import ThemesPage from '../lib/pages/themes-page.js';
import ThemePreviewPage from '../lib/pages/theme-preview-page.js';
import ThemeDetailPage from '../lib/pages/theme-detail-page.js';
import ViewSitePage from '../lib/pages/view-site-page';
import ThemeDialogComponent from '../lib/components/theme-dialog-component.js';
import NavbarComponent from '../lib/components/navbar-component';
import SidebarComponent from '../lib/components/sidebar-component';
import * as dataHelper from '../lib/data-helper';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();
const httpsHost = config.get( 'httpsHosts' ).indexOf( host ) !== -1;

var driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `[${host}] Switching Themes: (${screenSize})`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.describe( 'Switching Themes @parallel @jetpack', function() {
		test.it( 'Delete Cookies and Login', function() {
			driverManager.clearCookiesAndDeleteLocalStorage( driver );
			let loginFlow = new LoginFlow( driver );
			loginFlow.loginAndSelectThemes();
		} );

		test.describe( 'Can switch free themes', function() {
			test.it( 'Can select a different free theme', function() {
				this.themesPage = new ThemesPage( driver );
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
				this.themeDialogComponent.goBackToThemes();
				this.themeDetailPage = new ThemeDetailPage( driver );
				this.themeDetailPage.displayed().then( function( displayed ) {
					assert.equal( displayed, true, 'Could not see the theme detail page after activating a new theme' );
				} );
			} );
		} );
	} );
} );

test.describe( `[${host}] Activating Themes: (${screenSize}) @parallel @jetpack`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );
	let siteAddress;

	test.describe( 'Activating Themes:', function() {
		test.it( 'Delete Cookies and Login', function() {
			driverManager.clearCookiesAndDeleteLocalStorage( driver );
			let loginFlow = new LoginFlow( driver );
			loginFlow.login();
			let readerPage = new ReaderPage( this.driver, true );
			return readerPage.waitForPage();
		} );

		test.it( 'Can capture the site\'s address from the sidebar and select themes', function() {
			let navbarComponent = new NavbarComponent( this.driver );
			navbarComponent.clickMySites();
			let sidebarComponent = new SidebarComponent( driver );
			return sidebarComponent.getCurrentSiteDomain().then( ( domain ) => {
				siteAddress = domain;
			} );
		} );

		test.it( 'Can select themes', function() {
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

			test.it( 'Can see the theme thanks dialog and view the site from this dialog', function() {
				let themeDialogComponent = new ThemeDialogComponent( driver );
				themeDialogComponent.viewSite();
				let viewSitePage = new ViewSitePage( driver );
				viewSitePage.urlDisplayed().then( ( urlDisplayed ) => {
					const expectedSiteAddress = `${ httpsHost ? 'https://' : 'http://' }${ siteAddress }/`;
					assert.equal( urlDisplayed, expectedSiteAddress, `The url displayed '${ urlDisplayed }' is not equal to the expected address of '${ expectedSiteAddress }'` );
				} );
			} );
		} );
	} );
} );
