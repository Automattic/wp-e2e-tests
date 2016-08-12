import assert from 'assert';
import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager.js';

import WPAdminLogonPage from '../lib/pages/wp-admin/wp-admin-logon-page';
import WPAdminSidebar from '../lib/pages/wp-admin/wp-admin-sidebar';
import WPAdminPluginsPage from '../lib/pages/wp-admin/wp-admin-plugins-page';
import WPAdminJetpackPage from '../lib/pages/wp-admin/wp-admin-jetpack-page';
import JetpackAuthorizePage from '../lib/pages/jetpack-authorize-page';
import JetpackPlansPage from '../lib/pages/jetpack-plans-page';

import LoginFlow from '../lib/flows/login-flow';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

var driver;

test.before( 'Start Browser', function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `Jetpack WordPress.com Connect: '${ screenSize }'`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.before( 'Delete cookies and local storage', function() {
		driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	test.it( 'Log on to our Jetpack site', function() {
		this.wpAdminLogonPage = new WPAdminLogonPage( driver, true );
		this.wpAdminLogonPage.logonAsJetpackAdmin();
	} );

	test.it( 'Make sure that Jetpack is disconnected by deactivating and reactivating Jetpack', function() {
		this.wpAdminSidebar = new WPAdminSidebar( driver );
		this.wpAdminSidebar.selectPlugins();
		this.wpAdminPluginsPage = new WPAdminPluginsPage( driver );
		this.wpAdminPluginsPage.deactivateJetpack();
		this.wpAdminPluginsPage.activateJetpack();
	} );

	test.it( 'Can connect Jetpack to WordPress.com and see At A Glance', function() {
		this.wpAdminSidebar = new WPAdminSidebar( driver );
		this.wpAdminSidebar.selectJetpack();
		this.wpAdminJetpackPage = new WPAdminJetpackPage( driver );
		this.wpAdminJetpackPage.connectWordPressCom();
		this.jetpackAuthorizePage = new JetpackAuthorizePage( driver );
		this.jetpackAuthorizePage.chooseSignIn();
		this.loginFlow = new LoginFlow( driver, 'jetpackConnectUser' );
		this.loginFlow.loginUsingExistingForm();
		this.jetpackAuthorizePage = new JetpackAuthorizePage( driver );
		this.jetpackAuthorizePage.approveConnection();
		this.jetpackPlansPage = new JetpackPlansPage( driver );
		this.jetpackPlansPage.chooseFreePlan();
		this.wpAdminJetpackPage = new WPAdminJetpackPage( driver );
		this.wpAdminJetpackPage.atAGlanceDisplayed().then( ( atAGlanceDisplayed ) => {
			assert( atAGlanceDisplayed, 'The WP Admin Jetpack \'At a Glance\' page is not displayed after running Jetpack Connect' );
		} );
	} );
} );
