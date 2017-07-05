import assert from 'assert';
import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager';

import NavBarComponent from '../lib/components/navbar-component';
import SidebarComponent from '../lib/components/sidebar-component';
import StoreSidebarComponent from '../lib/components/store-sidebar-component';
import StoreDashboardPage from '../lib/pages/woocommerce/store-dashboard-page';
import StoreSettingsPage from '../lib/pages/woocommerce/store-settings-page';
import StoreOrdersPage from '../lib/pages/woocommerce/store-orders-page';
import StoreOrdersAddPage from '../lib/pages/woocommerce/store-orders-add-page';
import StorePromotionsPage from '../lib/pages/woocommerce/store-promotions-page';
import StoreExtensionsPage from '../lib/pages/woocommerce/store-extensions-page';
import StoreProductsPage from '../lib/pages/woocommerce/store-products-page';
import StoreProductsImportPage from '../lib/pages/woocommerce/store-products-import-page';
import AddProductPage from '../lib/pages/woocommerce/add-product-page';
// import StoreStatsPage from '../lib/pages/woocommerce/store-stats-page';

import LoginFlow from '../lib/flows/login-flow';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

let driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `Can see WooCommerce Store option in Calypso '${ screenSize }' @parallel`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.before( function() {
		driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	// Login as WooCommerce store user and open the sidebar
	test.before( function() {
		this.loginFlow = new LoginFlow( driver, 'wooCommerceUser' );
		this.loginFlow.login();
		this.navBarComponent = new NavBarComponent( driver );
		this.navBarComponent.clickMySites();
	} );

	test.it( 'Can see \'Store (BETA)\' option in main Calypso menu for an AT WooCommerce site set to the US', function() {
		this.sideBarComponent = new SidebarComponent( driver );
		this.sideBarComponent.storeOptionDisplayed().then( ( displayed ) => {
			assert( displayed, 'The Store menu option is not displayed for the AT WooCommerce site set to the US' );
		} );
	} );

	test.it( 'The \'Store (BETA)\' option opens the store dashboard with its own sidebar', function() {
		this.sideBarComponent = new SidebarComponent( driver );
		this.sideBarComponent.selectStoreOption();
		this.storeDashboardPage = new StoreDashboardPage( driver );
		this.storeSidebarComponent = new StoreSidebarComponent( driver );
		this.storeSidebarComponent.displayed().then( ( d ) => {
			assert( d, 'The store sidebar is not displayed' );
		} );
	} );
} );

test.describe( `Can manage WooCommerce products option in Calypso '${ screenSize }' @parallel`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.before( function() {
		driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	// Login as WooCommerce store user and open the woo store
	test.before( function() {
		this.loginFlow = new LoginFlow( driver, 'wooCommerceUser' );
		return this.loginFlow.loginAndOpenWooStore();
	} );

	test.it( 'Can see \'Products\' option in the Woo store sidebar', function() {
		this.storeDashboardPage = new StoreDashboardPage( driver );
		this.storeSidebarComponent = new StoreSidebarComponent( driver );
		this.storeSidebarComponent.productsLinkDisplayed().then( ( d ) => {
			assert( d, 'The store sidebar products link is not displayed' );
		} );
	} );

	test.it( 'Can see the products page with at least one product when selecting the products option in the Woo store sidebar', function() {
		this.storeDashboardPage = new StoreDashboardPage( driver );
		this.storeSidebarComponent = new StoreSidebarComponent( driver );
		this.storeSidebarComponent.selectProducts();
		this.storeProductsPage = new StoreProductsPage( driver );
		this.storeProductsPage.atLeastOneProductDisplayed().then( ( displayed ) => {
			assert( displayed, 'No Woo products are displayed on the product page' );
		} );
	} );
} );

test.xdescribe( `WooCommerce on Calypso /store/{storeslug}: '${ screenSize }' @parallel`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.before( function() {
		driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	// Login as WooCommerce store user
	test.before( function() {
		this.loginFlow = new LoginFlow( driver, 'wooCommerceUser' );
		this.loginFlow.login();
	} );

	test.it( 'Can see store placeholder page when visiting /store/{storeSlug}', function() {
		this.storeDashboardPage = new StoreDashboardPage( driver, true );
		this.storeDashboardPage.displayed().then( (shown ) => {
			assert( shown, 'Could not see the WooCommerce store dashboard page after visiting /store' );
		} );
	} );
} );

test.xdescribe( `WooCommerce on Calypso /store/products/{storeslug}: '${ screenSize }' @parallel`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.before( function() {
		driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	// Login as WooCommerce store user
	test.before( function() {
		this.loginFlow = new LoginFlow( driver, 'wooCommerceUser' );
		this.loginFlow.login();
	} );

	test.it( 'Can see store placeholder page when visiting /store/products/{storeSlug}', function() {
		this.storeProductsPage = new StoreProductsPage( driver, true );
		this.storeProductsPage.displayed().then( ( shown ) => {
			assert( shown, 'Could not see the WooCommerce store products page after visiting /store/products' );
		} );
	} );
} );

test.xdescribe( `WooCommerce on Calypso /store/products/{storeslug}/import: '${ screenSize }' @parallel`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.before( function() {
		driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	// Login as WooCommerce store user
	test.before( function() {
		this.loginFlow = new LoginFlow( driver, 'wooCommerceUser' );
		this.loginFlow.login();
	} );

	test.it( 'Can see store placeholder page when visiting /store/products/{storeSlug}/import', function() {
		this.storeProductsImportPage = new StoreProductsImportPage( driver, true );
		this.storeProductsImportPage.displayed().then( ( shown ) => {
			assert( shown, 'Could not see the WooCommerce store products import page after visiting /store/products/{storeSlug}/import' );
		} );
	} );
} );

test.xdescribe( `WooCommerce on Calypso /store/orders/{storeslug}: '${ screenSize }' @parallel`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.before( function() {
		driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	// Login as WooCommerce store user
	test.before( function() {
		this.loginFlow = new LoginFlow( driver, 'wooCommerceUser' );
		this.loginFlow.login();
	} );

	test.it( 'Can see store placeholder page when visiting /store/orders/{storeSlug}', function() {
		this.storeOrdersPage = new StoreOrdersPage( driver, true );
		this.storeOrdersPage.displayed().then( ( shown ) => {
			assert( shown, 'Could not see the WooCommerce store orders page after visiting /store/orders' );
		} );
	} );
} );

test.xdescribe( `WooCommerce on Calypso /store/orders/{storeslug}/add: '${ screenSize }' @parallel`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.before( function() {
		driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	// Login as WooCommerce store user
	test.before( function() {
		this.loginFlow = new LoginFlow( driver, 'wooCommerceUser' );
		this.loginFlow.login();
	} );

	test.it( 'Can see store placeholder page when visiting /store/orders/{storeSlug}/add', function() {
		this.storeOrdersAddPage = new StoreOrdersAddPage( driver, true );
		this.storeOrdersAddPage.displayed().then( ( shown ) => {
			assert( shown, 'Could not see the WooCommerce store orders add page after visiting /store/orders/{storeSlug}/add' );
		} );
	} );
} );

test.xdescribe( `WooCommerce on Calypso /store/promotions/{storeslug}: '${ screenSize }' @parallel`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.before( function() {
		driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	// Login as WooCommerce store user
	test.before( function() {
		this.loginFlow = new LoginFlow( driver, 'wooCommerceUser' );
		this.loginFlow.login();
	} );

	test.it( 'Can see store placeholder page when visiting /store/promotions/{storeSlug}', function() {
		this.storePromotionsPage = new StorePromotionsPage( driver, true );
		this.storePromotionsPage.displayed().then( ( shown ) => {
			assert( shown, 'Could not see the WooCommerce store promotions page after visiting /store/promotions' );
		} );
	} );
} );

test.xdescribe( `WooCommerce on Calypso /store/extensions/{storeslug}: '${ screenSize }' @parallel`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.before( function() {
		driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	// Login as WooCommerce store user
	test.before( function() {
		this.loginFlow = new LoginFlow( driver, 'wooCommerceUser' );
		this.loginFlow.login();
	} );

	test.it( 'Can see store placeholder page when visiting /store/extensions/{storeSlug}', function() {
		this.storeExtensionsPage = new StoreExtensionsPage( driver, true );
		this.storeExtensionsPage.displayed().then( ( shown ) => {
			assert( shown, 'Could not see the WooCommerce store extensions page after visiting /store/promotions' );
		} );
	} );
} );

test.xdescribe( `WooCommerce on Calypso /store/settings/{storeslug}: '${ screenSize }' @parallel`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.before( function() {
		driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	// Login as WooCommerce store user
	test.before( function() {
		this.loginFlow = new LoginFlow( driver, 'wooCommerceUser' );
		this.loginFlow.login();
	} );

	test.it( 'Can see store placeholder page when visiting /store/settings/{storeSlug}', function() {
		this.storeSettingsPage = new StoreSettingsPage( driver, true );
		this.storeSettingsPage.displayed().then( ( shown ) => {
			assert( shown, 'Could not see the WooCommerce store settings page after visiting /store/settings' );
		} );
	} );
} );

	// 							http://calypso.localhost:3000/store/settings/{storeslug}
	// 								http://calypso.localhost:3000/store/settings/{storeslug}/checkout
	// 									http://calypso.localhost:3000/store/settings/{storeslug}/shipping
	// 										http://calypso.localhost:3000/store/settings/{storeslug}/tax

test.xdescribe( `WooCommerce on Calypso /store/products/{storeslug}/add: '${ screenSize }' @parallel`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.before( function() {
		driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	// Login as WooCommerce store user
	test.before( function() {
		this.loginFlow = new LoginFlow( driver, 'wooCommerceUser' );
		this.loginFlow.login();
	} );

	test.it( 'Can see the add product placeholder page when visiting /store/products/add', function() {
		this.addProductPage = new AddProductPage( driver, true );
		this.addProductPage.displayed().then( ( shown ) => {
			assert( shown, 'Could not see the WooCommerce add product page after visting /store/products/add' );
		} );
	} );
} );
