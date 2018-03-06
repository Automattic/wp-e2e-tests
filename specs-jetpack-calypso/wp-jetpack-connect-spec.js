/** @format */
import test from 'selenium-webdriver/testing';
import config from 'config';
import assert from 'assert';

import * as driverManager from '../lib/driver-manager';
import * as dataHelper from '../lib/data-helper';

import AddNewSitePage from '../lib/pages/add-new-site-page';
import JetpackAuthorizePage from '../lib/pages/jetpack-authorize-page';
import JetpackConnectInstallPage from '../lib/pages/jetpack-connect-install-page';
import PickAPlanPage from '../lib/pages/signup/pick-a-plan-page';
import WPAdminPluginsPage from '../lib/pages/wp-admin/wp-admin-plugins-page.js';
import WPAdminPluginPopup from '../lib/pages/wp-admin/wp-admin-plugin-popup';
import WPAdminUpdatesPage from '../lib/pages/wp-admin/wp-admin-updates-page';
import WPAdminJetpackPage from '../lib/pages/wp-admin/wp-admin-jetpack-page.js';
import WPAdminSidebar from '../lib/pages/wp-admin/wp-admin-sidebar.js';
import LoginFlow from '../lib/flows/login-flow';
import SidebarComponent from '../lib/components/sidebar-component';
import JetpackConnectFlow from '../lib/flows/jetpack-connect-flow';
import JetpackComPage from '../lib/pages/external/jetpackcom-page';
import JetpackConnectPage from '../lib/pages/jetpack/jetpack-connect-page';
import PlansPage from '../lib/pages/plans-page';
import LoginPage from '../lib/pages/login-page';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

let driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `Jetpack Connect: (${ screenSize })`, function() {
	this.timeout( mochaTimeOut );

	test.describe( 'Disconnect expired sites: @parallel @jetpack @canary', function() {
		this.bailSuite( true );

		test.before( function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'Can disconnect any expired sites', function() {
			const jnFlow = new JetpackConnectFlow( driver );
			return jnFlow.removeSites();
		} );
	} );

	test.describe( 'Connect From Calypso: @parallel @jetpack @canary', function() {
		this.bailSuite( true );

		test.before( function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'Can create wporg site', function() {
			const template = dataHelper.isRunningOnJetpackBranch() ? 'branch' : 'default';
			this.jnFlow = new JetpackConnectFlow( driver, null, template );
			return this.jnFlow.createJNSite();
		} );

		test.it( 'Can log in', function() {
			const loginFlow = new LoginFlow( driver, 'jetpackConnectUser' );
			loginFlow.loginAndSelectMySite();
		} );

		test.it( 'Can add new site', function() {
			const sidebarComponent = new SidebarComponent( driver );
			sidebarComponent.addNewSite( driver );
			const addNewSitePage = new AddNewSitePage( driver );
			return addNewSitePage.addSiteUrl( this.jnFlow.url );
		} );

		test.it( 'Can click the free plan button', function() {
			this.pickAPlanPage = new PickAPlanPage( driver );
			return this.pickAPlanPage.selectFreePlanJetpack();
		} );

		test.it( 'Has site URL in route', function( done ) {
			const siteSlug = this.jnFlow.url.replace( /^https?:\/\//, '' );
			return driver.getCurrentUrl().then( url => {
				if ( url.includes( siteSlug ) ) {
					return done();
				}
				done( `Route ${ url } does not include site slug ${ siteSlug }` );
			} );
		} );
	} );

	test.describe( 'Connect From wp-admin: @parallel @jetpack @canary', function() {
		this.bailSuite( true );

		test.before( function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'Can create wporg site', function() {
			const template = dataHelper.isRunningOnJetpackBranch() ? 'branch' : 'default';
			this.jnFlow = new JetpackConnectFlow( driver, null, template );
			return this.jnFlow.createJNSite();
		} );

		test.it( 'Can navigate to the Jetpack dashboard', function() {
			this.wpAdminSidebar = new WPAdminSidebar( driver );
			return this.wpAdminSidebar.selectJetpack();
		} );

		test.it( 'Can click the Connect Jetpack button', function() {
			this.wpAdminJetpack = new WPAdminJetpackPage( driver );
			return this.wpAdminJetpack.connectWordPressCom();
		} );

		test.it( 'Can login into WordPress.com', function() {
			const loginFlow = new LoginFlow( driver, 'jetpackConnectUser' );
			return loginFlow.loginUsingExistingForm();
		} );

		test.it( 'Can approve connection on the authorization page', function() {
			this.jetpackAuthorizePage = new JetpackAuthorizePage( driver );
			return this.jetpackAuthorizePage.approveConnection();
		} );

		test.it( 'Can click the free plan button', function() {
			this.pickAPlanPage = new PickAPlanPage( driver );
			return this.pickAPlanPage.selectFreePlanJetpack();
		} );

		test.it( 'Is redirected back to the Jetpack dashboard with Jumpstart displayed', function() {
			return this.wpAdminJetpack.jumpstartDisplayed();
		} );
	} );

	test.describe( 'Connect From Calypso, when Jetpack not installed: @parallel @jetpack', function() {
		this.bailSuite( true );

		test.before( function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'Can create wporg site', function() {
			this.jnFlow = new JetpackConnectFlow( driver, null, 'noJetpack' );
			return this.jnFlow.createJNSite();
		} );

		test.it( 'Can log in', function() {
			const loginFlow = new LoginFlow( driver, 'jetpackConnectUser' );
			return loginFlow.loginAndSelectMySite();
		} );

		test.it( 'Can add new site', function() {
			this.sidebarComponent = new SidebarComponent( driver );
			this.sidebarComponent.addNewSite();
			const addNewSitePage = new AddNewSitePage( driver );
			return addNewSitePage.addSiteUrl( this.jnFlow.url );
		} );

		test.it( 'Can click Install Jetpack button in the instructions page', function() {
			this.jetpackConnectInstall = new JetpackConnectInstallPage( driver );
			return this.jetpackConnectInstall.clickInstallButton();
		} );

		test.it( 'Can click the install button in the wp-admin plugin iframe', function() {
			const wpAdminPluginPopup = new WPAdminPluginPopup( driver );
			return wpAdminPluginPopup.installPlugin();
		} );

		test.it( 'Can click the plugin Activate button in the wp-admin updates page', function() {
			const wpAdminUpdatesPage = new WPAdminUpdatesPage( driver );
			return wpAdminUpdatesPage.activatePlugin();
		} );

		test.it( 'Can click the Connect Jetpack button', function() {
			this.wpAdminPluginsPage = new WPAdminPluginsPage( driver );
			return this.wpAdminPluginsPage.connectJetpackAfterActivation();
		} );

		test.it( 'Can click the free plan button', function() {
			this.pickAPlanPage = new PickAPlanPage( driver );
			return this.pickAPlanPage.selectFreePlanJetpack();
		} );
	} );

	test.describe( 'Connect from Jetpack.com using free plan: @parallel @jetpack', function() {
		this.bailSuite( true );

		test.before( function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'Can create wporg site', function() {
			this.jnFlow = new JetpackConnectFlow( driver, null, 'noJetpack' );
			return this.jnFlow.createJNSite();
		} );

		test.it( 'Can select Try it Free', function() {
			const jepackComPage = new JetpackComPage( driver );
			return jepackComPage.selectTryItFree();
		} );

		test.it( 'Can select free plan', function() {
			const pickAPlanPage = new PickAPlanPage( driver );
			return pickAPlanPage.selectFreePlan();
		} );

		test.it( 'Can start connection flow using JN site', function() {
			const connectPage = new JetpackConnectPage( driver );
			return connectPage.addSiteUrl( this.jnFlow.url );
		} );

		test.it( 'Can click Install Jetpack button in the instructions page', function() {
			const jetpackConnectInstall = new JetpackConnectInstallPage( driver, false );
			return jetpackConnectInstall.clickInstallButton();
		} );

		test.it( 'Can click the install button in the wp-admin plugin iframe', function() {
			const wpAdminPluginPopup = new WPAdminPluginPopup( driver );
			return wpAdminPluginPopup.installPlugin();
		} );

		test.it( 'Can click the plugin Activate button in the wp-admin updates page', function() {
			const wpAdminUpdatesPage = new WPAdminUpdatesPage( driver );
			return wpAdminUpdatesPage.activatePlugin();
		} );

		test.it( 'Can click the Connect Jetpack button', function() {
			const wpAdminPluginsPage = new WPAdminPluginsPage( driver );
			return wpAdminPluginsPage.connectJetpackAfterActivation();
		} );

		test.it( 'Can log into WP.com', function() {
			const user = dataHelper.getAccountConfig( 'jetpackConnectUser' );
			const loginPage = new LoginPage( driver );
			return loginPage.login( user[0], user[1] );
		} );

		test.it( 'Can confirm that current plan is Free', function() {
			const plansPage = new PlansPage( driver );
			assert( plansPage.confirmCurrentPlan( 'free' ) );
		} );
	} );
} );
