/** @format */

import test from 'selenium-webdriver/testing';
import config from 'config';

import * as driverManager from '../../lib/driver-manager';
import * as dataHelper from '../../lib/data-helper';

import LoginFlow from '../../lib/flows/login-flow';
import SidebarComponent from '../../lib/components/sidebar-component';
import SettingsPage from '../../lib/pages/settings-page';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

var driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `[${ host }] Jetpack Connection Removal: (${ screenSize }) @jetpack`, function() {
	this.timeout( mochaTimeOut );

	test.describe( 'Deactivate Jetpack Plugin:', function() {
		this.bailSuite( true );

		test.before( function() {
			return driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.it( 'Can log into WordPress.com and open My Sites', () => {
			this.loginFlow = new LoginFlow( driver, 'jetpackUserCI' );
			return this.loginFlow.loginAndSelectMySite();
		} );

		test.it( 'Can open site Settings', () => {
			this.sidebarComponent = new SidebarComponent( driver );
			return this.sidebarComponent.selectSettings();
		} );

		test.it( 'Can manage connection', () => {
			this.settingsPage = new SettingsPage( driver );
			this.settingsPage.manageConnection();
		} );

		test.it( 'Can disconnect site', () => {
			this.settingsPage.disconnectSite();
		} );
	} );
} );
