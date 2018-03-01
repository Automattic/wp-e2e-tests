import test from 'selenium-webdriver/testing';
import config from 'config';

import JetpackAuthorizePage from '../lib/pages/jetpack-authorize-page';
import WPAdminSidebar from '../lib/pages/wp-admin/wp-admin-sidebar.js';
import LoginFlow from '../lib/flows/login-flow';
import JetpackConnectFlow from '../lib/flows/jetpack-connect-flow';

import * as driverManager from '../lib/driver-manager';
import * as dataHelper from '../lib/data-helper';
import WPAdminDashboardPage from '../lib/pages/wp-admin/wp-admin-dashboard-page';
import WPAdminNewUserPage from '../lib/pages/wp-admin/wp-admin-new-user-page';
import WPAdminLogonPage from '../lib/pages/wp-admin/wp-admin-logon-page';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();
const account = 'jetpackUser' + host;

let driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `Jetpack Connect: (${ screenSize })`, function() {
	this.timeout( mochaTimeOut * 2 );

	test.describe( 'Disconnect expired sites: @parallel @jetpack', function() {
		this.bailSuite( true );

		test.before( function() {
			return driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.it( 'Can diconnect any expired sites', () => {
			let jnFlow = new JetpackConnectFlow( driver, account );
			return jnFlow.removeSites();
		} );
	} );

	test.describe( 'Connect via SSO: @parallel @jetpack', function() {
		this.bailSuite( true );

		test.before( function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'Can create new JN site & connect from WP Admin', () => {
			this.jnFlow = new JetpackConnectFlow( driver, account );
			return this.jnFlow.connectFromWPAdmin();
		} );

		test.it( 'Add new user as Subscriber in wp-admin', () => {
			const emailAddress = dataHelper.getAccountConfig( 'subscriberUser' )[3];
			const wpAdminSidebar = new WPAdminSidebar( driver );
			return wpAdminSidebar.selectAddNewUser()
			.then( () => {
				const newUserPage = new WPAdminNewUserPage( driver );
				return newUserPage.addUser( emailAddress );
			} );
		} );

		test.it( 'Log out from WP Admin', () => {
			return driverManager.ensureNotLoggedIn( driver )
			.then( () => {
				const wpAdminDashboardPage = new WPAdminDashboardPage( driver, this.jnFlow.url );
				wpAdminDashboardPage.logout();
			} );
		} );

		test.it( 'Can log in', () => {
			const loginFlow = new LoginFlow( driver, 'subscriberUser' );
			loginFlow.loginAndSelectMySite();
		} );

		test.it( 'Can login via SSO into WP Admin', () => {
			const loginPage = new WPAdminLogonPage( driver, this.jnFlow.url, { visit: true } );
			return loginPage.logonSSO()
			.then( () => {
				let jetpackAuthPage = new JetpackAuthorizePage( driver );
				jetpackAuthPage.approveSSOConnection();
			} )
			.then( () => new WPAdminDashboardPage( driver ) );
		} );
	} );
} );
