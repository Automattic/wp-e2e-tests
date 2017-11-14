/** @format */
import test from 'selenium-webdriver/testing';
import config from 'config';

import * as driverManager from '../lib/driver-manager';
import * as driverHelper from '../lib/driver-helper';
import { By } from 'selenium-webdriver';

import AddNewSitePage from '../lib/pages/add-new-site-page';
import CreateYourAccountPage from '../lib/pages/signup/create-your-account-page.js';
import JetpackAuthorizePage from '../lib/pages/jetpack-authorize-page';
import PickAPlanPage from '../lib/pages/signup/pick-a-plan-page';
import SettingsPage from '../lib/pages/settings-page';
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

test.describe( `Jetpack Connect: (${ screenSize }) @jetpack`, function() {
	this.timeout( mochaTimeOut );

	test.describe( 'Connect From Calypso:', function() {
		this.bailSuite( true );

		test.before( function() {
			return driverManager.clearCookiesAndDeleteLocalStorage( driver );
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

		test.it( 'Can disconnect existing jetpack sites', () => {
			this.sidebarComponent = new SidebarComponent( driver );

			const removeSites = () => {
				this.sidebarComponent.selectJetpackSite().then( foundSite => {
					if ( ! foundSite ) {
						// Refresh to put the site selector back into a sane state
						// where it knows there is only one site. Can probably
						// make the 'add site' stuff below more robust instead.
						return driver.navigate().refresh();
					}
					// Wait until Custom Post Type links are present to avoid sidebar positions
					// changing when attempting to click 'Settings'
					driverHelper.waitTillPresentAndDisplayed( driver, By.linkText( 'Feedback' ) );

					this.sidebarComponent.selectSettings();
					const settingsPage = new SettingsPage( driver );
					settingsPage.manageConnection();
					settingsPage.disconnectSite();
					driverHelper.waitTillPresentAndDisplayed( driver, By.css( '.is-success' ) );
					removeSites();
				} );
			};

			removeSites();
		} );

		test.it( 'Can add new site', () => {
			this.sidebarComponent.addNewSite( driver );
			const addNewSitePage = new AddNewSitePage( driver );
			addNewSitePage.addSiteUrl( this.url );
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

	test.describe( 'Connect From wp-admin:', function() {
		this.bailSuite( true );

		test.before( function() {
			return driverManager.clearCookiesAndDeleteLocalStorage( driver );
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
} );
