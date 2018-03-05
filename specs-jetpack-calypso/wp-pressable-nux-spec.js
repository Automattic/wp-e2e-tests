import test from 'selenium-webdriver/testing';
import config from 'config';
import assert from 'assert';

import PressableLogonPage from '../lib/pages/pressable/pressable-logon-page';
import PressableSitesPage from '../lib/pages/pressable/pressable-sites-page';
import PressableApprovePage from '../lib/pages/pressable/pressable-approve-page';
import PressableSiteSettingsPage from '../lib/pages/pressable/pressable-site-settings-page';
import JetpackAuthorizePage from '../lib/pages/jetpack-authorize-page';
import WPAdminDashboardPage from '../lib/pages/wp-admin/wp-admin-dashboard-page';

import * as driverManager from '../lib/driver-manager';
import * as dataHelper from '../lib/data-helper';
import LoginPage from '../lib/pages/login-page';
import PressableNUXFlow from '../lib/flows/pressable-nux-flow';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

var driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `[${host}] Pressable NUX: (${screenSize}) @jetpack`, function() {
	this.timeout( mochaTimeOut * 2 );
	this.bailSuite( true );

	test.before( function() {
		return driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	test.it( 'Can log into Pressable', function() {
		this.pressableLoginPage = new PressableLogonPage( driver, true );
		return this.pressableLoginPage.loginWithWP();
	} );

	test.it( 'Can log into WordPress.com', function() {
		const user = dataHelper.getAccountConfig( 'jetpackUserPRESSABLE' );
		this.loginPage = new LoginPage( driver );
		return this.loginPage.login( user[0], user[1] );
	} );

	test.it( 'Can approve login with WordPress', function() {
		this.pressableApprovePage = new PressableApprovePage( driver );
		return this.pressableApprovePage.approve();
	} );

	test.it( 'Can create new site', function() {
		this.siteName = dataHelper.getNewBlogName();
		this.pressableSitesPage = new PressableSitesPage( driver );
		return this.pressableSitesPage.addNewSite( this.siteName );
	} );

	test.it( 'Can go to site settings', function() {
		return this.pressableSitesPage.gotoSettings( this.siteName );
	} );

	test.it( 'Can proceed to Jetpack activation', function() {
		this.pressableSiteSettinsPage = new PressableSiteSettingsPage( driver );
		return this.pressableSiteSettinsPage.activateJetpackPremium();
	} );

	test.it( 'Can approve connection on the authorization page', function() {
		this.jetpackAuthorizePage = new JetpackAuthorizePage( driver );
		return this.jetpackAuthorizePage.approveConnection();
	} );

	test.it( 'Can wait for 15 secs until Jetpack Rewind will be ready for configuration', function() {
		return driver.sleep( 15000 );
	} );

	test.it( 'Can proceed with Pressable NUX flow', function() {
		this.nuxFlow = new PressableNUXFlow( driver );
		return this.nuxFlow.addSiteCredentials();
	} );

	test.it( 'Can see expected content in the Jetpack dashboard', function() {
		this.wpDashboardPage = new WPAdminDashboardPage( driver );
		return this.wpDashboardPage.isJITMessageDisplayed( 'rewind' ).then( ( shown ) => {
			assert( !shown, 'Rewind JITM is still visible' );
		} );
	} );

	test.after( function() {
		this.pressableSitesPage = new PressableSitesPage( driver, true );
		return this.pressableSitesPage.deleteFirstSite();
	} );
} );
