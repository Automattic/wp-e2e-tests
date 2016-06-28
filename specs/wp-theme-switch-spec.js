import test from 'selenium-webdriver/testing';
import config from 'config';
import assert from 'assert';

import * as driverManager from '../lib/driver-manager.js';

import LoginFlow from '../lib/flows/login-flow.js';

import ThemesPage from '../lib/pages/themes-page.js';
import ThemePreviewPage from '../lib/pages/theme-preview-page.js';
import ThemeDetailPage from '../lib/pages/theme-detail-page.js';
import CustomizerPage from '../lib/pages/customizer-page.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

var driver;

test.before( 'Start Browser', function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( 'Themes: (' + screenSize + ')', function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.describe( 'Switching Themes:', function() {
		test.it( 'Delete Cookies and Login', function() {
			driverManager.clearCookiesAndDeleteLocalStorage( driver );
			let loginFlow = new LoginFlow( driver );
			loginFlow.loginAndSelectThemes();
		} );

		test.describe( 'Can switch free themes', function() {
			test.it( 'Can select a different free theme', function() {
				this.themesPage = new ThemesPage( driver );
				this.themesPage.searchFor( 'Twenty F' );
				this.themesPage.waitForThemeStartingWith( 'Twenty F' );
				return this.themesPage.selectNewThemeStartingWith( 'Twenty F' );
			} );

			test.it( 'Can see theme Details page, open Preview/Live Demo', function() {
				this.themeDetailPage = new ThemeDetailPage( driver );
				return this.themeDetailPage.openLiveDemo();
			} );

			test.it( 'Can preview, customize and save theme', function() {
				this.themePreviewPage = new ThemePreviewPage( driver );
				this.themePreviewPage.customize();

				this.customizerPage = new CustomizerPage( driver );
				return this.customizerPage.saveNewTheme();
			} );

			test.it( 'Can see themes page', function() {
				this.themesPage = new ThemesPage( driver );
				this.themesPage.displayed().then( function( displayed ) {
					assert.equal( displayed, true, 'Could not see the themes page after selecting a new theme' );
				} );
			} );
		} );
	} );
} );
