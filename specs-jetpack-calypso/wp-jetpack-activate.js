import test from 'selenium-webdriver/testing';
import config from 'config';
import assert from 'assert';

import * as driverManager from '../lib/driver-manager';
import * as dataHelper from '../lib/data-helper';

import LoginFlow from '../lib/flows/login-flow';

import PlansPage from '../lib/pages/plans-page';
import PickAPlanPage from '../lib/pages/signup/pick-a-plan-page';
import StatsPage from '../lib/pages/stats-page';
import WPAdminJetpackPage from '../lib/pages/wp-admin/wp-admin-jetpack-page';
import JetpackPlanSalesPage from '../lib/pages/jetpack-plans-sales-page';

import ReaderPage from '../lib/pages/reader-page.js';
import SecurePaymentComponent from '../lib/components/secure-payment-component.js';
import ShoppingCartWidgetComponent from '../lib/components/shopping-cart-widget-component.js';
import SidebarComponent from '../lib/components/sidebar-component.js';
import NavbarComponent from '../lib/components/navbar-component.js';

import WPAdminSidebar from '../lib/pages/wp-admin/wp-admin-sidebar';
import WPAdminPluginsPage from '../lib/pages/wp-admin/wp-admin-plugins-page';
import JetpackAuthorizePage from '../lib/pages/jetpack-authorize-page';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

var driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `[${host}] Jetpack Connection: (${screenSize}) @jetpack`, function() {
	this.timeout( mochaTimeOut );

	test.describe( 'Activate Jetpack Plugin:', function() {
		this.bailSuite( true );

		test.before( function() {
			return driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.it( 'Can log into WordPress.com', () => {
			this.loginFlow = new LoginFlow( driver, 'jetpackUserMULTI' );
			return this.loginFlow.login();
		} );

		test.it( 'Can log into site via wp-login.php', () => {
			return this.loginFlow.login( { jetpackDIRECT: true } );
		} );

		test.it( 'Can open Plugins page', () => {
			this.wpAdminSidebar = new WPAdminSidebar( driver );
			return this.wpAdminSidebar.selectPlugins();
		} );

		test.it( 'Can activate Jetpack', () => {
			this.wpAdminPlugins = new WPAdminPluginsPage( driver );
			return this.wpAdminPlugins.activateJetpack();
		} );

		test.it( 'Can connect Jetpack', () => {
			this.wpAdminPlugins.connectJetpackAfterActivation();
			this.jetpackAuthorizePage = new JetpackAuthorizePage( driver );
			this.jetpackAuthorizePage.approveConnection();
		} );

		test.it( 'Can select Free plan', () => {
                        this.pickAPlanPage = new PickAPlanPage( driver );
                        return this.pickAPlanPage.selectFreePlan();			
		} );
	} );
} );
