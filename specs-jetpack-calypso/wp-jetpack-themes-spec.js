import test from 'selenium-webdriver/testing';
import config from 'config';
import assert from 'assert';

import * as driverManager from '../lib/driver-manager';
import * as dataHelper from '../lib/data-helper';

import LoginFlow from '../lib/flows/login-flow';

import ThemesPage from '../lib/pages/themes-page';
import ThemePreviewPage from '../lib/pages/theme-preview-page';
import ThemeDetailPage from '../lib/pages/theme-detail-page';
import ThemeDialogComponent from '../lib/components/theme-dialog-component';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

var driver;

test.before( 'Start Browser', function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( host + ' Jetpack Themes: (' + screenSize + ')', function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.describe( 'Seeing Jetpack Themes:', function() {
		test.it( 'Delete Cookies and Login', function() {
			driverManager.clearCookiesAndDeleteLocalStorage( driver );
			const loginFlow = new LoginFlow( driver, 'jetpackUser' + host );
			loginFlow.loginAndSelectThemes();
		} );

		test.xdescribe( 'Can switch free themes', function() {
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
