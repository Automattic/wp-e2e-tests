/** @format */

import test from 'selenium-webdriver/testing';
import config from 'config';

import * as driverManager from '../../lib/driver-manager';
import * as dataHelper from '../../lib/data-helper';

import LoginFlow from '../../lib/flows/login-flow';

import PickAPlanPage from '../../lib/pages/signup/pick-a-plan-page';
import WPAdminJetpackPage from '../../lib/pages/wp-admin/wp-admin-jetpack-page';

import WPAdminSidebar from '../../lib/pages/wp-admin/wp-admin-sidebar';
import WPAdminPluginsPage from '../../lib/pages/wp-admin/wp-admin-plugins-page';
import JetpackAuthorizePage from '../../lib/pages/jetpack-authorize-page';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

var driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `[${ host }] Jetpack Connection: (${ screenSize }) @jetpack`, function() {
	this.timeout( mochaTimeOut );

	test.describe( 'Activate Jetpack Plugin:', function() {
		this.bailSuite( true );

		test.before( function() {
			return driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.it( 'Can log into WordPress.com', () => {
			this.loginFlow = new LoginFlow( driver, 'jetpackUserCI' );
			return this.loginFlow.login();
		} );

		test.it( 'Can log into site via wp-login.php', () => {
			return this.loginFlow.login( { jetpackDIRECT: true } );
		} );

		test.it( 'Can open Plugins page', () => {
			this.wpAdminSidebar = new WPAdminSidebar( driver );
			return this.wpAdminSidebar.selectPlugins();
		} );

		test.it( 'Can activate Jetpack', () => {
			this.wpAdminPlugins = new WPAdminPluginsPage( driver );
			return this.wpAdminPlugins.activateJetpack();
		} );

		test.it( 'Can connect Jetpack', () => {
			this.wpAdminPlugins.connectJetpackAfterActivation();
			this.jetpackAuthorizePage = new JetpackAuthorizePage( driver );
			this.jetpackAuthorizePage.approveConnection();
		} );

		test.it( 'Can select Free plan', () => {
			this.pickAPlanPage = new PickAPlanPage( driver );
			return this.pickAPlanPage.selectFreePlan();
		} );

		test.it( 'Can activate recommended features', () => {
			this.jetpackDashboard = new WPAdminJetpackPage( driver );
			return this.jetpackDashboard.activateRecommendedFeatures();
		} );
	} );
} );
