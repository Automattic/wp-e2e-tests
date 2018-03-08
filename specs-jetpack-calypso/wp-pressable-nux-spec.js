import test from 'selenium-webdriver/testing';
import config from 'config';

import PressableLogonPage from '../lib/pages/pressable/pressable-logon-page';
import PressableSitesPage from '../lib/pages/pressable/pressable-sites-page';
import PressableApprovePage from '../lib/pages/pressable/pressable-approve-page';
import PressableSiteSettingsPage from '../lib/pages/pressable/pressable-site-settings-page';
import JetpackAuthorizePage from '../lib/pages/jetpack-authorize-page';

import * as driverManager from '../lib/driver-manager';
import * as dataHelper from '../lib/data-helper';
import PressableNUXFlow from '../lib/flows/pressable-nux-flow';
import ReaderPage from '../lib/pages/reader-page';
import SidebarComponent from '../lib/components/sidebar-component';
import StatsPage from '../lib/pages/stats-page';
import ActivityPage from '../lib/pages/stats/activity-page';
import NavbarComponent from '../lib/components/navbar-component';
import JetpackConnectFlow from '../lib/flows/jetpack-connect-flow';
import LoginFlow from '../lib/flows/login-flow';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();
const account = 'jetpackUserPRESSABLE';

var driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `[${host}] Pressable NUX: (${screenSize})`, function() {
	this.timeout( mochaTimeOut * 2 );

	test.describe( 'Disconnect expired sites: @parallel @jetpack', function() {
		this.bailSuite( true );

		test.before( function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'Can disconnect any expired sites', () => {
			let jnFlow = new JetpackConnectFlow( driver, account );
			return jnFlow.removeSites();
		} );
	} );

	test.describe( 'Connect via Pressable @parallel @jetpack', function() {
		this.bailSuite( true );

		test.before( function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'Can log into WordPress.com', function() {
			this.loginFlow = new LoginFlow( driver, account );
			return this.loginFlow.login();
		} );

		test.it( 'Can log into Pressable', function() {
			this.pressableLoginPage = new PressableLogonPage( driver, true );
			return this.pressableLoginPage.loginWithWP();
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

		test.it( 'Can wait for 25 sec until Jetpack Rewind will be ready for configuration', function() {
			return driver.sleep( 25000 );
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

		test.after( function() {
			this.pressableSitesPage = new PressableSitesPage( driver, true );
			return this.pressableSitesPage.deleteFirstSite();
		} );
	} );
} );
