import assert from 'assert';
import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager';
import * as dataHelper from '../lib/data-helper';

import PluginsPage from '../lib/pages/plugins-page';
import SettingsPage from '../lib/pages/settings-page';
import PluginsBrowserPage from '../lib/pages/plugins-browser-page';

import PluginDetailsPage from '../lib/pages/plugin-details-page';
import SidebarComponent from '../lib/components/sidebar-component';
import NavbarComponent from '../lib/components/navbar-component';
import LoginFlow from '../lib/flows/login-flow';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `${host} Jetpack Photon on Calypso: '${ screenSize }'`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.before( function() {
		driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	test.before( function() {
		let loginFlow = new LoginFlow( driver, 'jetpackUser' + host );
		loginFlow.loginAndSelectSettings();
	} );

	test.describe( 'Can see Photon option for images', function() {
		test.it( 'Can see navigate to writing settings for the site', function() {
			this.settingsPage = new SettingsPage( driver );
			return this.settingsPage.selectWriting();
		} );

		test.it( 'Can see media settings section', function() {
			this.settingsPage.mediaSettingsSectionDisplayed().then( ( shown ) => {
				assert( shown, 'Can\'t see the media settings section under the Writing settings' );
			} );
		} );

		test.it( 'Can see the Photon toggle switch', function() {
			this.settingsPage.photonToggleDisplayed().then( ( shown ) => {
				assert( shown, 'Can\'t see the Photon setting toggle under the Writing settings' );
			} );
		} );
	} );
} );
