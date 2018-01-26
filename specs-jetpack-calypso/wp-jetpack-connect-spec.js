/** @format */
import test from 'selenium-webdriver/testing';
import config from 'config';

import * as driverManager from '../lib/driver-manager';
import * as driverHelper from '../lib/driver-helper';
import { By } from 'selenium-webdriver';

import AddNewSitePage from '../lib/pages/add-new-site-page';
import CreateYourAccountPage from '../lib/pages/signup/create-your-account-page.js';
import JetpackAuthorizePage from '../lib/pages/jetpack-authorize-page';
import JetpackConnectInstallPage from '../lib/pages/jetpack-connect-install-page';
import PickAPlanPage from '../lib/pages/signup/pick-a-plan-page';
import WPAdminPluginsPage from '../lib/pages/wp-admin/wp-admin-plugins-page.js';
import WPAdminPluginPopup from '../lib/pages/wp-admin/wp-admin-plugin-popup';
import WPAdminUpdatesPage from '../lib/pages/wp-admin/wp-admin-updates-page';
import WporgCreatorPage from '../lib/pages/wporg-creator-page';
import WPAdminJetpackPage from '../lib/pages/wp-admin/wp-admin-jetpack-page.js';
import WPAdminSidebar from '../lib/pages/wp-admin/wp-admin-sidebar.js';
import LoginFlow from '../lib/flows/login-flow';
import SidebarComponent from '../lib/components/sidebar-component';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

var driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `Jetpack Connect: (${ screenSize })`, function() {
	this.timeout( mochaTimeOut);

	test.describe( 'Disconnect expired sites: @parallel @jetpack', function() {
		this.bailSuite( true );

		test.before( function() {
			return driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.it( 'Can log in', () => {
			const loginFlow = new LoginFlow( driver, 'jetpackConnectUser' );
			loginFlow.loginAndSelectMySite();
		} );

		test.it( 'Can disconnect any expired sites', () => {
			this.sidebarComponent = new SidebarComponent( driver );

			const removeSites = () => {
				this.sidebarComponent.removeBrokenSite().then( removed => {
					if ( ! removed ) {
						// no sites left to remove
						return;
					}
					// seems like it is not waiting for this
					driverHelper.waitTillPresentAndDisplayed(
						driver,
						By.css( '.notice.is-success.is-dismissable' )
					);
					driverHelper.clickWhenClickable(
						driver,
						By.css( '.notice.is-dismissable .notice__dismiss' )
					);
					removeSites();
				} );
			};

			removeSites();
		} );
	} );

	test.describe( 'Connect From Calypso: @parallel @jetpack', function() {
		this.bailSuite( true );

		test.before( function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'Can create wporg site', () => {
			this.wporgCreator = new WporgCreatorPage( driver );
			this.wporgCreator.waitForWpadmin();
		} );

		test.it( 'Can get URL', () => {
			this.wporgCreator.getUrl().then( url => {
				this.url = url;
			} );
		} );

		test.it( 'Can log in', () => {
			const loginFlow = new LoginFlow( driver, 'jetpackConnectUser' );
			loginFlow.loginAndSelectMySite();
		} );

		test.it( 'Can add new site', () => {
			const sidebarComponent = new SidebarComponent( driver );
			sidebarComponent.addNewSite( driver );
			const addNewSitePage = new AddNewSitePage( driver );
			return addNewSitePage.addSiteUrl( this.url );
		} );

		test.it( 'Can click the free plan button', () => {
			this.pickAPlanPage = new PickAPlanPage( driver );
			return this.pickAPlanPage.selectFreePlanJetpack();
		} );

		test.it( 'Has site URL in route', done => {
			const siteSlug = this.url.replace( /^https?:\/\//, '' );
			return driver.getCurrentUrl().then( url => {
				if ( url.includes( siteSlug ) ) {
					return done();
				}
				done( `Route ${ url } does not include site slug ${ siteSlug }` );
			} );
		} );
	} );

	test.describe( 'Connect From wp-admin: @parallel @jetpack', function() {
		this.bailSuite( true );

		test.before( function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'Can create a WP.org site', () => {
			this.wporgCreator = new WporgCreatorPage( driver );
			this.wporgCreator.waitForWpadmin();
		} );

		test.it( 'Can get URL of WP.org site', () => {
			this.wporgCreator.getUrl().then( url => {
				this.url = url;
			} );
		} );

		test.it( 'Can navigate to the Jetpack dashboard', () => {
			this.wpAdminSidebar = new WPAdminSidebar( driver );
			return this.wpAdminSidebar.selectJetpack();
		} );

		test.it( 'Can click the Connect Jetpack button', () => {
			this.wpAdminJetpack = new WPAdminJetpackPage( driver );
			return this.wpAdminJetpack.connectWordPressCom();
		} );

		test.it( 'Can click the login link in the account creation page', () => {
			this.createAccountPage = new CreateYourAccountPage( driver );
			return this.createAccountPage.clickLoginLink();
		} );

		test.it( 'Can login into WordPress.com', () => {
			const loginFlow = new LoginFlow( driver, 'jetpackConnectUser' );
			return loginFlow.loginUsingExistingForm();
		} );

		test.it( 'Can approve connection on the authorization page', () => {
			this.jetpackAuthorizePage = new JetpackAuthorizePage( driver );
			return this.jetpackAuthorizePage.approveConnection();
		} );

		test.it( 'Can click the free plan button', () => {
			this.pickAPlanPage = new PickAPlanPage( driver );
			return this.pickAPlanPage.selectFreePlanJetpack();
		} );

		test.it( 'Is redirected back to the Jetpack dashboard with Jumpstart displayed', () => {
			return this.wpAdminJetpack.jumpstartDisplayed();
		} );
	} );

	test.describe( 'Connect From Calypso, when Jetpack not installed:', function() {
		this.bailSuite( true );

		test.before( function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'Can create wporg site', () => {
			this.wporgCreator = new WporgCreatorPage( driver, 'noJetpack' );
			this.wporgCreator.waitForWpadmin();
		} );

		test.it( 'Can get URL', () => {
			this.wporgCreator.getUrl().then( url => {
				this.url = url;
			} );
		} );

		test.it( 'Can log in', () => {
			const loginFlow = new LoginFlow( driver, 'jetpackConnectUser' );
			return loginFlow.loginAndSelectMySite();
		} );

		test.it( 'Can add new site', () => {
			this.sidebarComponent = new SidebarComponent( driver );
			this.sidebarComponent.addNewSite();
			const addNewSitePage = new AddNewSitePage( driver );
			return addNewSitePage.addSiteUrl( this.url );
		} );

		test.it( 'Can click Install Jetpack button in the instructions page', () => {
			this.jetpackConnectInstall = new JetpackConnectInstallPage( driver );
			return this.jetpackConnectInstall.clickInstallButton();
		} );

		test.it( 'Can click the install button in the wp-admin plugin iframe', () => {
			const wpAdminPluginPopup = new WPAdminPluginPopup( driver );
			return wpAdminPluginPopup.installPlugin();
		} );

		test.it( 'Can click the plugin Activate button in the wp-admin updates page', () => {
			const wpAdminUpdatesPage = new WPAdminUpdatesPage( driver );
			return wpAdminUpdatesPage.activatePlugin();
		} );

		test.it( 'Can click the Connect Jetpack button', () => {
			this.wpAdminPluginsPage = new WPAdminPluginsPage( driver );
			return this.wpAdminPluginsPage.connectJetpackAfterActivation();
		} );

		test.it( 'Can click the free plan button', () => {
			this.pickAPlanPage = new PickAPlanPage( driver );
			return this.pickAPlanPage.selectFreePlanJetpack();
		} );
	} );
} );
