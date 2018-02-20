import test from 'selenium-webdriver/testing';
import config from 'config';
import assert from 'assert';

import LoginFlow from '../lib/flows/login-flow';

import WPAdminJetpackPage from '../lib/pages/wp-admin/wp-admin-jetpack-page';
import PressableLogonPage from '../lib/pages/pressable/pressable-logon-page';
import PressableSitesPage from '../lib/pages/pressable/pressable-sites-page';
import PressableApprovePage from '../lib/pages/pressable-approve-page';
import PressableSiteSettingsPage from '../lib/pages/pressable/pressable-site-settings-page';
import JetpackAuthorizePage from '../lib/pages/jetpack-authorize-page';

import * as driverManager from '../lib/driver-manager';
import * as dataHelper from '../lib/data-helper';
import EmailClient from '../lib/email-client';
import WPAdminSidebar from '../lib/pages/wp-admin/wp-admin-sidebar';
import ReaderPage from '../lib/pages/reader-page';
import NavbarComponent from '../lib/components/navbar-component';
import SidebarComponent from '../lib/components/sidebar-component';
import StatsPage from '../lib/pages/stats-page';
import ActivityPage from '../lib/pages/stats/activity-page';
import WPAdminDashboardPage from '../lib/pages/wp-admin/wp-admin-dashboard-page';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

const apiKey = config.get( 'mailosaurAPIKey' );
const Mailosaur = require( 'mailosaur' )( apiKey );

var driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	this.emailClient = new EmailClient( 'ndcpbd5u' );
	this.emailClient.deleteAllEmail();

	this.mailbox = new Mailosaur.Mailbox( 'ndcpbd5u' );
	driver = driverManager.startBrowser();
} );

test.describe( `[${host}] Pressable NUX: (${screenSize}) @jetpack`, function() {
	this.timeout( mochaTimeOut );

	test.describe( 'Flow', function() {
		this.bailSuite( true );

		test.before( function() {
			return driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.it( 'Can log into WordPress.com', function() {
			this.loginFlow = new LoginFlow( driver, 'jetpackUserPRESSABLE' );
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

		test.it( 'Can get credentials from email', function() {
			const emailAddress = 'account.ndcpbd5u@mailosaur.io';
			return this.emailClient.pollEmailsByRecipient( emailAddress )
			.then( ( emails ) => {
				//Disabled due to a/b test on activation email. See https://github.com/Automattic/wp-e2e-tests/issues/819
				//assert.equal( emails.length, 2, 'The number of newly registered emails is not equal to 2 (activation and magic link)' );
				for ( let email of emails ) {
					if ( email.subject.indexOf( 'WordPress credentials' ) > -1 ) {
						this.username = email.text.body.match( /(Username:\r\n)(\w+)/ )[2];
						this.password = email.text.body.match( /(Password:\r\n)(\w+)/ )[2];
						return true;
					}
				}
			} );
		} );

		test.it( 'Can go to site settings', function() {
			this.pressableSitesPage = new PressableSitesPage( driver );
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
			this.readerPage = new ReaderPage( driver, true );

			this.navbarComponent = new NavbarComponent( driver );
			this.navbarComponent.clickMySites();

			const siteURL = `${this.siteName}.mystagingwebsite.com`;
			let sideBarComponent = new SidebarComponent( driver );
			sideBarComponent.selectSiteSwitcher();
			return sideBarComponent.searchForSite( siteURL );
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
			if ( !this.siteName ) {
				return;
			}
			this.pressableSitesPage = new PressableSitesPage( driver, true );
			return this.pressableSitesPage.gotoSettings( this.siteName )
			.then( () => {
				this.pressableSiteSettinsPage = new PressableSiteSettingsPage( driver );
				return this.pressableSiteSettinsPage.deleteSite();
			} );
		} );
	} );
} );
