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

	test.describe( 'Jetpack Themes:', function() {
		test.it( 'Delete Cookies and Login', function() {
			driverManager.clearCookiesAndDeleteLocalStorage( driver );
			const loginFlow = new LoginFlow( driver, 'jetpackUser' + host );
			loginFlow.loginAndSelectThemes();
		} );

		test.describe( 'Current Theme', function() {
			test.it( 'Can see the current theme', function() {
				this.themesPage = new ThemesPage( driver );
				this.themesPage.getCurrentThemeName().then( ( name ) => {
					assert( name !== '' );
				} );
			} );

			test.it( 'Can see a \'customize\' link to the wp-admin customizer', function() {
				this.themesPage = new ThemesPage( driver );
				this.themesPage.getCustomizeLink().then( ( link ) => {
					assert( link.indexOf( '/wp-admin/customize.php' ) > -1 );
				} );
			} );

			test.it( 'Can see an \'info\' link to the wp-admin customizer', function() {
				this.themesPage = new ThemesPage( driver );
				this.themesPage.getInfoLink().then( ( link ) => {
					assert( link.indexOf( '/wp-admin/themes.php?' ) > -1 );
				} );
			} );
		} );
	} );
} );
