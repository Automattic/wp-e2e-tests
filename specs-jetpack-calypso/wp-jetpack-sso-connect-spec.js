import test from 'selenium-webdriver/testing';
import config from 'config';

import LoginFlow from '../lib/flows/login-flow';
import SignUpFlow from '../lib/flows/sign-up-flow';

import JetpackAuthorizePage from '../lib/pages/jetpack-authorize-page';
import WPAdminSidebar from '../lib/pages/wp-admin/wp-admin-sidebar.js';
import WPAdminDashboardPage from '../lib/pages/wp-admin/wp-admin-dashboard-page';
import WPAdminNewUserPage from '../lib/pages/wp-admin/wp-admin-new-user-page';
import WPAdminLogonPage from '../lib/pages/wp-admin/wp-admin-logon-page';
import LoginPage from '../lib/pages/login-page';

import * as driverManager from '../lib/driver-manager';
import * as dataHelper from '../lib/data-helper';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const signupInboxId = config.get( 'signupInboxId' );

let driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `Jetpack Connect: (${ screenSize })`, function() {
	this.timeout( mochaTimeOut * 2 );

	test.describe( 'Connect via SSO: @parallel @jetpack', function() {
		this.bailSuite( true );

		test.before( function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'Can register new Subscriber user', () => {
			this.emailAddress = dataHelper.getEmailAddress( dataHelper.getNewBlogName(), signupInboxId );
			this.password = config.get( 'passwordForNewTestSignUps' );
			this.signupFlow = new SignUpFlow( driver, {emailAddress: this.emailAddress, password: this.password} );
			return this.signupFlow.signupFreePlan()
			.then( () => this.signupFlow.activateAccount() )
			.then( () => driverManager.ensureNotLoggedIn( driver ) );
		} );

		test.it( 'Can log into WordPress.com', () => {
			this.loginFlow = new LoginFlow( driver );
			return this.loginFlow.login();
		} );

		test.it( 'Can log into site via Jetpack SSO', () => {
			return this.loginFlow.login( { jetpackSSO: true } );
		} );

		test.it( 'Add new user as Subscriber in wp-admin', () => {
			const wpAdminSidebar = new WPAdminSidebar( driver );
			return wpAdminSidebar.selectAddNewUser()
			.then( () => {
				const newUserPage = new WPAdminNewUserPage( driver );
				return newUserPage.addUser( this.emailAddress );
			} );
		} );

		test.it( 'Log out from WP Admin', () => {
			return driverManager.ensureNotLoggedIn( driver )
			.then( () => {
				const wpAdminDashboardPage = new WPAdminDashboardPage( driver, dataHelper.getJetpackSiteName() );
				wpAdminDashboardPage.logout();
			} );
		} );

		test.it( 'Can log in as Subscriber', () => {
			const loginFlow = new LoginPage( driver, true );
			loginFlow.login( this.emailAddress, this.password );
		} );

		test.it( 'Can login via SSO into WP Admin', () => {
			const loginPage = new WPAdminLogonPage( driver, dataHelper.getJetpackSiteName(), { visit: true } );
			return loginPage.logonSSO()
			.then( () => {
				let jetpackAuthPage = new JetpackAuthorizePage( driver );
				jetpackAuthPage.approveSSOConnection();
			} )
			.then( () => new WPAdminDashboardPage( driver ) );
		} );
	} );
} );
