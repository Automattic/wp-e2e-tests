import test from 'selenium-webdriver/testing';
import { By } from 'selenium-webdriver';
import config from 'config';

import JetpackAuthorizePage from '../lib/pages/jetpack-authorize-page';
import WPAdminSidebar from '../lib/pages/wp-admin/wp-admin-sidebar.js';
import LoginFlow from '../lib/flows/login-flow';
import SidebarComponent from '../lib/components/sidebar-component';
import JetpackConnectFlow from '../lib/flows/jetpack-connect-flow';

import * as driverManager from '../lib/driver-manager';
import * as driverHelper from '../lib/driver-helper';
import * as dataHelper from '../lib/data-helper';
import SignUpFlow from '../lib/flows/sign-up-flow';
import WPAdminDashboardPage from '../lib/pages/wp-admin/wp-admin-dashboard-page';
import WPAdminNewUserPage from '../lib/pages/wp-admin/wp-admin-new-user-page';
import WPAdminLogonPage from '../lib/pages/wp-admin/wp-admin-logon-page';
import EmailClient from '../lib/email-client';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const signupInboxId = config.get( 'signupInboxId' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();
const userAccount = 'jetpackUser' + host;

let driver;
let blogCreds;

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

		test.it( 'Can log in', () => {
			const loginFlow = new LoginFlow( driver, userAccount );
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

	test.describe( 'Connect via SSO: @parallel @jetpack', function() {
		this.bailSuite( true );

		test.before( function() {
			this.emailClient = new EmailClient( signupInboxId );
			const blogName = dataHelper.getNewBlogName();
			blogCreds = {
				blogName: blogName,
				expectedBlogAddresses: dataHelper.getExpectedFreeAddresses( blogName ),
				emailAddress: dataHelper.getEmailAddress( blogName, signupInboxId ),
				password: config.get( 'passwordForNewTestSignUps' ),
			};
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'Can create new JN site & connect from WP Admin', () => {
			this.jnFlow = new JetpackConnectFlow( driver, userAccount );
			return this.jnFlow.connectFromWPAdmin();
		} );

		test.it( 'Add new user as Subscriber in wp-admin', () => {
			const wpAdminSidebar = new WPAdminSidebar( driver );
			return wpAdminSidebar.selectAddNewUser()
			.then( () => {
				const newUserPage = new WPAdminNewUserPage( driver );
				return newUserPage.addUser( blogCreds.emailAddress );
			} );
		} );

		test.it( 'Log out from WP Admin', () => {
			return driverManager.ensureNotLoggedIn( driver )
			.then( () => {
				const wpAdminDashboardPage = new WPAdminDashboardPage( driver, this.jnFlow.url );
				wpAdminDashboardPage.logout();
			} );
		} );

		test.it( 'Can Sign up new user and activate his account', () => {
			this.signupFlow = new SignUpFlow( driver, blogCreds );
			return this.signupFlow.signupFreePlan()
			.then( () => this.signupFlow.activateAccount() );
		} );

		test.it( 'Can connect via SSO on WP Admin', () => {
			const loginPage = new WPAdminLogonPage( driver, this.jnFlow.url, { visit: true } );
			return loginPage.logonSSO()
			.then( () => {
				let jetpackAuthPage = new JetpackAuthorizePage( driver );
				jetpackAuthPage.approveSSOConnection();
			} )
			.then( () => new WPAdminDashboardPage( driver, this.jnFlow.url ) );
		} );
	} );
} );
