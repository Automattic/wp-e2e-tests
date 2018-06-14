/** @format */

import test from 'selenium-webdriver/testing';
import config from 'config';

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
import NavBarComponent from '../lib/components/nav-bar-component.js';

import WPAdminSidebar from '../lib/pages/wp-admin/wp-admin-sidebar';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;

test.before( async function() {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

test.describe( `[${ host }] Jetpack Plans: (${ screenSize }) @jetpack`, function() {
	this.timeout( mochaTimeOut );

	test.describe( 'Purchase Premium Plan:', function() {
		this.bailSuite( true );

		test.before( async function() {
			return await driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.it( 'Can log into WordPress.com', async function() {
			this.loginFlow = new LoginFlow( driver, 'jetpackUser' + host );
			return await this.loginFlow.login();
		} );

		test.it( 'Can log into site via Jetpack SSO', async function() {
			return await this.loginFlow.login( { jetpackSSO: true } );
		} );

		test.it( 'Can open Jetpack dashboard', async function() {
			await WPAdminSidebar.refreshIfJNError( driver );
			this.wpAdminSidebar = await WPAdminSidebar.Expect( driver );
			return await this.wpAdminSidebar.selectJetpack();
		} );

		test.it( 'Can find and click Upgrade nudge button', async function() {
			this.jetpackDashboard = new WPAdminJetpackPage( driver );
			// The nudge buttons are loaded after the page, and there's no good loaded status indicator to key off of
			return driver.sleep( 3000 ).then( async () => {
				return await this.jetpackDashboard.clickUpgradeNudge();
			} );
		} );

		test.it( 'Can click the Proceed button', async function() {
			this.jetpackPlanSalesPage = new JetpackPlanSalesPage( driver );
			// The upgrade buttons are loaded after the page, and there's no good loaded status indicator to key off of
			return driver.sleep( 3000 ).then( async () => {
				return await this.jetpackPlanSalesPage.clickPurchaseButton();
			} );
		} );

		test.it( 'Can then see secure payment component', async function() {
			return await SecurePaymentComponent.Expect( driver );
		} );

		// Remove all items from basket for clean up
		test.after( async function() {
			await ReaderPage.Visit( driver );

			const navbarComponent = await NavBarComponent.Expect( driver );
			await navbarComponent.clickMySites();

			await StatsPage.Expect( driver );

			const sidebarComponent = await SidebarComponent.Expect( driver );
			await sidebarComponent.selectPlan();

			this.domainsPage = new PlansPage( driver );
			const shoppingCartWidgetComponent = await ShoppingCartWidgetComponent.Expect( driver );
			await shoppingCartWidgetComponent.empty();
		} );
	} );
} );
