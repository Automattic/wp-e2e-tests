/** @format */

import test from 'selenium-webdriver/testing';
import config from 'config';
import assert from 'assert';

import * as driverManager from '../lib/driver-manager';
import * as dataHelper from '../lib/data-helper';

import LoginFlow from '../lib/flows/login-flow';

import PlansPage from '../lib/pages/plans-page';
import StatsPage from '../lib/pages/stats-page';
import WPAdminJetpackPage from '../lib/pages/wp-admin/wp-admin-jetpack-page';
import JetpackPlanSalesPage from '../lib/pages/jetpack-plans-sales-page';

import ReaderPage from '../lib/pages/reader-page.js';
import SecurePaymentComponent from '../lib/components/secure-payment-component.js';
import ShoppingCartWidgetComponent from '../lib/components/shopping-cart-widget-component.js';
import SidebarComponent from '../lib/components/sidebar-component.js';
import NavbarComponent from '../lib/components/navbar-component.js';

import WPAdminSidebar from '../lib/pages/wp-admin/wp-admin-sidebar';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `[${ host }] Jetpack Plans: (${ screenSize }) @jetpack`, function() {
	this.timeout( mochaTimeOut );

	test.describe( 'Purchase Premium Plan:', function() {
		this.bailSuite( true );

		test.before( function() {
			return driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.it( 'Can log into WordPress.com', () => {
			this.loginFlow = new LoginFlow( driver, 'jetpackUser' + host );
			return this.loginFlow.login();
		} );

		test.it( 'Can log into site via Jetpack SSO', () => {
			return this.loginFlow.login( { jetpackSSO: true } );
		} );

		test.it( 'Can open Jetpack dashboard', () => {
			this.wpAdminSidebar = new WPAdminSidebar( driver );
			return this.wpAdminSidebar.selectJetpack();
		} );

		test.it( 'Can find and click Upgrade nudge button', () => {
			this.jetpackDashboard = new WPAdminJetpackPage( driver );
			// The nudge buttons are loaded after the page, and there's no good loaded status indicator to key off of
			return driver.sleep( 3000 ).then( () => {
				return this.jetpackDashboard.clickUpgradeNudge();
			} );
		} );

		test.it( 'Can click the Proceed button', () => {
			this.jetpackPlanSalesPage = new JetpackPlanSalesPage( driver );
			// The upgrade buttons are loaded after the page, and there's no good loaded status indicator to key off of
			return driver.sleep( 3000 ).then( () => {
				return this.jetpackPlanSalesPage.clickPurchaseButton();
			} );
		} );

		test.it( 'Can then see secure payment component', () => {
			const securePaymentComponent = new SecurePaymentComponent( driver );
			securePaymentComponent.displayed().then( displayed => {
				assert.equal( displayed, true, 'Could not see the secure payment component' );
			} );
		} );

		// Remove all items from basket for clean up
		test.after( () => {
			this.readerPage = new ReaderPage( driver, true );

			this.navbarComponent = new NavbarComponent( driver );
			this.navbarComponent.clickMySites();

			this.statsPage = new StatsPage( driver, true );

			this.sideBarComponent = new SidebarComponent( driver );
			this.sideBarComponent.selectPlan();

			this.domainsPage = new PlansPage( driver );
			this.shoppingCartWidgetComponent = new ShoppingCartWidgetComponent( driver );
			this.shoppingCartWidgetComponent.empty();
		} );
	} );
} );
