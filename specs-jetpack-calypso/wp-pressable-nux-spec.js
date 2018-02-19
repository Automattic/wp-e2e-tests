import test from 'selenium-webdriver/testing';
import config from 'config';
import assert from 'assert';

import LoginFlow from '../lib/flows/login-flow';

import PickAPlanPage from '../lib/pages/signup/pick-a-plan-page';
import WPAdminJetpackPage from '../lib/pages/wp-admin/wp-admin-jetpack-page';
import JetpackPlanSalesPage from '../lib/pages/jetpack-plans-sales-page';

import SecurePaymentComponent from '../lib/components/secure-payment-component.js';

import PressableLogonPage from '../lib/pages/pressable/pressable-logon-page';
import PressableSitesPage from '../lib/pages/pressable/pressable-sites-page';
import PressableApprovePage from '../lib/pages/pressable-approve-page';
import PressableSiteSettingsPage from '../lib/pages/pressable/pressable-site-settings-page';
import JetpackAuthorizePage from '../lib/pages/jetpack-authorize-page';

import * as driverManager from '../lib/driver-manager';
import * as dataHelper from '../lib/data-helper';
import EmailClient from '../lib/email-client';
import WPAdminLogonPage from '../lib/pages/wp-admin/wp-admin-logon-page';
import WPAdminSidebar from '../lib/pages/wp-admin/wp-admin-sidebar';

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

		// test.before( function() {
		// 	return this.emailClient.deleteAllEmailByID( 'account.ndcpbd5u@mailosaur.io' );
		// } );

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

		test.it( 'EMAIL', function() {
			// EMAIL: account.ndcpbd5u@mailosaur.io
			// pswd: wTSw9i2MA89LuPrYd3ZD

			const emailAddress = 'account.ndcpbd5u@mailosaur.io';
			this.credentials = '';
			return this.emailClient.pollEmailsByRecipient( emailAddress )
			.then( ( emails ) => {
				//Disabled due to a/b test on activation email. See https://github.com/Automattic/wp-e2e-tests/issues/819
				//assert.equal( emails.length, 2, 'The number of newly registered emails is not equal to 2 (activation and magic link)' );
				for ( let email of emails ) {
					if ( email.subject.indexOf( 'WordPress credentials' ) > -1 ) {
						this.username = email.text.body.match( /(Username:\r\n)(\w+)/ )[2];
						this.password = email.text.body.match( /(Password:\r\n)(\w+)/ )[2];
						console.log( '====================================' );
						console.log( email.text.body );
						console.log( this.username );
						console.log( this.password );
						console.log( '====================================' );
						return true;
					}
				}
				assert( this.credentials !== undefined, 'Could not locate the magic login link email link' );
				return true;
			} );
		} );

		test.it( 'Can go to site settings', function() {
			this.pressableSitesPage = new PressableSitesPage( driver );
			return this.pressableSitesPage.gotoSettings( this.siteName );
		} );

		test.it( 'Can log into WP Admin', function() {
			this.pressableSiteSettinsPage = new PressableSiteSettingsPage( driver );
			return this.pressableSiteSettinsPage.gotoWPAdmin()
			.then( () => {
				this.wpLoginPage = new WPAdminLogonPage( driver );
				console.log( '====================================' );
				console.log( this.username );
				console.log( this.password );
				console.log( '====================================' );
				return this.wpLoginPage.login( this.username, this.password );
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

		test.it( 'Can approve connection on the authorization page', () => {
			this.jetpackAuthorizePage = new JetpackAuthorizePage( driver );
			return this.jetpackAuthorizePage.approveConnection();
		} );

		// test.it( 'Can proceed to Jetpack activation', () => {
		// 	this.pressableSiteSettinsPage = new PressableSiteSettingsPage( driver );
		// 	return this.pressableSiteSettinsPage.activateJetpackPremium();
		// } );

		test.it( '', () => {
		} );

		test.it( '', () => {
		} );

		test.it( '', () => {
		} );

		test.it( 'Can find and click Upgrade nudge button', () => {
		} );

		test.it( 'Can click the Proceed button', () => {
			this.jetpackPlanSalesPage = new JetpackPlanSalesPage( driver );
			// The upgrade buttons are loaded after the page, and there's no good loaded status indicator to key off of
			return driver.sleep( 3000 ).then( () => {
				return this.jetpackPlanSalesPage.clickPurchaseButton();
			} );
		} );

		test.it( 'Can click the purchase premium button', () => {
			this.pickAPlanPage = new PickAPlanPage( driver );
			return this.pickAPlanPage.selectPremiumPlan();
		} );

		test.it( 'Can then see secure payment component', () => {
			const securePaymentComponent = new SecurePaymentComponent( driver );
			securePaymentComponent.displayed().then( ( displayed ) => {
				assert.equal( displayed, true, 'Could not see the secure payment component' );
			} );
		} );
	} );
} );
