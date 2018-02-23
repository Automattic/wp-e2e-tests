import test from 'selenium-webdriver/testing';
import config from 'config';
import assert from 'assert';

import WPAdminJetpackPage from '../lib/pages/wp-admin/wp-admin-jetpack-page';
import PressableLogonPage from '../lib/pages/pressable/pressable-logon-page';
import PressableSitesPage from '../lib/pages/pressable/pressable-sites-page';
import PressableApprovePage from '../lib/pages/pressable-approve-page';
import PressableSiteSettingsPage from '../lib/pages/pressable/pressable-site-settings-page';
import JetpackAuthorizePage from '../lib/pages/jetpack-authorize-page';
import ReaderPage from '../lib/pages/reader-page';
import StatsPage from '../lib/pages/stats-page';
import ActivityPage from '../lib/pages/stats/activity-page';
import WPAdminDashboardPage from '../lib/pages/wp-admin/wp-admin-dashboard-page';

import WPAdminSidebar from '../lib/pages/wp-admin/wp-admin-sidebar';
import NavbarComponent from '../lib/components/navbar-component';
import SidebarComponent from '../lib/components/sidebar-component';

import * as driverManager from '../lib/driver-manager';
import * as dataHelper from '../lib/data-helper';
import LoginPage from '../lib/pages/login-page';

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
	this.timeout( mochaTimeOut );

	test.describe( 'Flow', function() {
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

		test.it( 'Can navigate to the Jetpack dashboard', function() {
			this.wpAdminSidebar = new WPAdminSidebar( driver );
			return this.wpAdminSidebar.selectJetpack();
		} );

		test.it( 'Can activate recommended features', function() {
			this.jetpackDashboard = new WPAdminJetpackPage( driver );
			return this.jetpackDashboard.activateRecommendedFeatures();
		} );

		test.it( 'Can open recently created site stats', function() {
			const siteURL = `${this.siteName}.mystagingwebsite.com`;
			// const siteURL = 'e2eflowtesting1519293477608988.mystagingwebsite.com';
			//
			this.readerPage = new ReaderPage( driver, true );

			this.navbarComponent = new NavbarComponent( driver );
			return this.navbarComponent.clickMySites()
			.then( () => {
				let sidebarComponent = new SidebarComponent( driver );
				return sidebarComponent.selectSiteSwitcher()
				.then( () => sidebarComponent.searchForSite( siteURL ) )
				.then( () => sidebarComponent.selectStats() );
			} );
		} );

		test.it( 'Can add site credentials', function() {
			this.statsPage = new StatsPage( driver );
			return this.statsPage.openActivity()
			.then( () => {
				this.activityPage = new ActivityPage( driver );
				return this.activityPage.addSiteCredentials();
			} );
		} );

		test.it( 'Can navigate to the Jetpack dashboard', function() {
			this.wpDashboardPage = new WPAdminDashboardPage( driver, this.siteName + '.mystagingwebsite.com' );
			return this.wpDashboardPage.isJITMessageDisplayed( 'rewind' ).then( ( shown ) => {
				assert( !shown, 'Rewind JITM is still visible' );
			} );
		} );

		test.after( function() {
			this.pressableSitesPage = new PressableSitesPage( driver, true );
			return this.pressableSitesPage.deleteFirstSite();
		} );
	} );
} );
