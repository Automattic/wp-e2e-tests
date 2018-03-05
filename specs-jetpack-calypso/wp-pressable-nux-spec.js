import test from 'selenium-webdriver/testing';
import config from 'config';
// import assert from 'assert';

import PressableLogonPage from '../lib/pages/pressable/pressable-logon-page';
import PressableSitesPage from '../lib/pages/pressable/pressable-sites-page';
import PressableApprovePage from '../lib/pages/pressable/pressable-approve-page';
import PressableSiteSettingsPage from '../lib/pages/pressable/pressable-site-settings-page';
import JetpackAuthorizePage from '../lib/pages/jetpack-authorize-page';
// import WPAdminDashboardPage from '../lib/pages/wp-admin/wp-admin-dashboard-page';

import * as driverManager from '../lib/driver-manager';
import * as dataHelper from '../lib/data-helper';
import LoginPage from '../lib/pages/login-page';
import PressableNUXFlow from '../lib/flows/pressable-nux-flow';
import ReaderPage from '../lib/pages/reader-page';
import SidebarComponent from '../lib/components/sidebar-component';
import StatsPage from '../lib/pages/stats-page';
import ActivityPage from '../lib/pages/stats/activity-page';
import NavbarComponent from '../lib/components/navbar-component';

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

	test.it( 'Can wait for 45 sec until Jetpack Rewind will be ready for configuration', function() {
		return driver.sleep( 45000 );
	} );

	test.it( 'Can proceed with Pressable NUX flow', function() {
		this.nuxFlow = new PressableNUXFlow( driver );
		return this.nuxFlow.addSiteCredentials();
	} );

	test.it( 'Can open Rewind activity page', function() {
		this.readerPage = new ReaderPage( driver, true );
		let navbarComponent = new NavbarComponent( driver );
		return navbarComponent.clickMySites()
		.then( () => {
			this.sidebarComponent = new SidebarComponent( driver );
			return this.sidebarComponent.selectSiteSwitcher();
		} )
		.then( () => this.sidebarComponent.searchForSite( this.siteName ) )
		.then( () => this.sidebarComponent.selectStats() )
		.then( () => {
			this.statsPage = new StatsPage( driver );
			return this.statsPage.openActivity();
		} );
	} );

	test.it( 'Can wait until Rewind backup is completed', function() {
		this.activityPage = new ActivityPage( driver );
		return this.activityPage.expandDayCard()
		.then( () => this.activityPage.waitUntilBackupCompleted() );
	} );
	// test.it( 'Can check if the initial backup is underway', function() {
	// 	this.activityPage = new ActivityPage( driver );
	// 	assert( this.activityPage.isBackupUnderway(), 'Initial backup is not initiated' );
	// } );

	// test.it( 'Can see expected content in the Jetpack dashboard', function() {
	// 	this.wpDashboardPage = new WPAdminDashboardPage( driver );
	// 	return this.wpDashboardPage.isJITMessageDisplayed( 'rewind' ).then( ( shown ) => {
	// 		assert( !shown, 'Rewind JITM is still visible' );
	// 	} );
	// } );

	test.after( function() {
		this.pressableSitesPage = new PressableSitesPage( driver, true );
		return this.pressableSitesPage.deleteFirstSite();
	} );
} );
