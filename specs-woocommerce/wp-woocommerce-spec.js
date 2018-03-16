import assert from 'assert';
import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager';
import * as mediaHelper from '../lib/media-helper';
import * as dataHelper from '../lib/data-helper';

import NavBarComponent from '../lib/components/navbar-component';
import SidebarComponent from '../lib/components/sidebar-component';
import StoreSidebarComponent from '../lib/components/store-sidebar-component';
import StoreDashboardPage from '../lib/pages/woocommerce/store-dashboard-page';
import StoreSettingsPage from '../lib/pages/woocommerce/store-settings-page';
import StoreOrdersPage from '../lib/pages/woocommerce/store-orders-page';
import StoreOrderDetailsPage from '../lib/pages/woocommerce/store-order-details-page';
import StoreProductsPage from '../lib/pages/woocommerce/store-products-page';
import AddEditProductPage from '../lib/pages/woocommerce/add-edit-product-page';

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

	test.it( 'Can see \'Store\' option in main Calypso menu for an AT WooCommerce site set to the US', function() {
		this.sideBarComponent = new SidebarComponent( driver );
		this.sideBarComponent.storeOptionDisplayed().then( ( displayed ) => {
			assert( displayed, 'The Store menu option is not displayed for the AT WooCommerce site set to the US' );
		} );
	} );

	test.it( 'The \'Store\' option opens the store dashboard with its own sidebar', function() {
		this.sideBarComponent = new SidebarComponent( driver );
		this.sideBarComponent.selectStoreOption();
		this.storeDashboardPage = new StoreDashboardPage( driver );
		this.storeSidebarComponent = new StoreSidebarComponent( driver );
		this.storeSidebarComponent.displayed().then( ( d ) => {
			assert( d, 'The store sidebar is not displayed' );
		} );
	} );
} );

test.describe( `Can see WooCommerce products in Calypso '${ screenSize }' @parallel`, function() {
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

test.describe( `Can add a new WooCommerce product in Calypso '${ screenSize }' @parallel`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );
	let fileDetails;

	test.before( function() {
		driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	// 'Create image file for upload'
	test.before( function() {
		mediaHelper.createFile( false, 'image-uploads-store' ).then( function( details ) {
			fileDetails = details;
		} );
	} );

	// Login as WooCommerce store user and open the woo store
	test.before( function() {
		this.loginFlow = new LoginFlow( driver, 'wooCommerceUser' );
		return this.loginFlow.loginAndOpenWooStore();
	} );

	test.it( 'Can add a new product via the Products Menu in the Woo store sidebar', function() {
		const productTitle = dataHelper.randomPhrase();
		const productDescription = 'Another test e2e product';
		this.storeDashboardPage = new StoreDashboardPage( driver );
		this.storeSidebarComponent = new StoreSidebarComponent( driver );
		this.storeSidebarComponent.addProduct();
		this.addProductPage = new AddEditProductPage( driver );
		this.addProductPage.enterTitle( productTitle );
		// this.addProductPage.addImage( fileDetails );
		this.addProductPage.enterDescription( productDescription );
		this.addProductPage.setPrice( '888.00' );
		this.addProductPage.setDimensions( '6', '7', '8' );
		this.addProductPage.setWeight( '2.2' );
		this.addProductPage.addQuantity( '80' );
		this.addProductPage.allowBackorders();
		this.addProductPage.addCategory( 'Art' ); //Adding a category at the end to prevent errors being thrown on save
		this.addProductPage.saveAndPublish();
		this.addProductPage.waitForSuccessNotice();
		this.storeProductsPage = new StoreProductsPage( driver );
		this.storeProductsPage.productDisplayed( productTitle ).then( ( displayed ) => {
			assert( displayed, `The product '${productTitle}' isn't being displayed on the products page after being added` );
		} );
		this.storeProductsPage.selectProduct( productTitle );
		this.editProductPage = new AddEditProductPage( driver );
		this.editProductPage.deleteProduct();
		this.editProductPage.waitForSuccessNotice();
		this.storeProductsPage = new StoreProductsPage( driver );
		this.storeProductsPage.productDisplayed( productTitle ).then( ( displayed ) => {
			assert( !displayed, `The product '${productTitle}' isn't still being displayed on the products page after being deleted` );
		} );
	} );

	test.after( function() {
		if ( fileDetails ) {
			mediaHelper.deleteFile( fileDetails ).then( function() {} );
		}
	} );
} );

test.describe( `Can see WooCommerce orders in Calypso '${ screenSize }' @parallel`, function() {
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

	test.it( 'Can see \'Orders\' option in the Woo store sidebar', function() {
		this.storeDashboardPage = new StoreDashboardPage( driver );
		this.storeSidebarComponent = new StoreSidebarComponent( driver );
		this.storeSidebarComponent.productsLinkDisplayed().then( ( d ) => {
			assert( d, 'The store sidebar orders link is not displayed' );
		} );
	} );

	test.it( 'Can see the orders page with at least one order when selecting the orders option in the Woo store sidebar', function() {
		this.storeDashboardPage = new StoreDashboardPage( driver );
		this.storeSidebarComponent = new StoreSidebarComponent( driver );
		this.storeSidebarComponent.selectOrders();
		this.storeOrdersPage = new StoreOrdersPage( driver );
		this.storeOrdersPage.atLeastOneOrderDisplayed().then( ( displayed ) => {
			assert( displayed, 'No Woo orders are displayed on the orders page' );
		} );
	} );

	test.it( 'Can see the order details page when opening an order, product details page when clicking a product in an order', function() {
		this.storeSidebarComponent = new StoreSidebarComponent( driver );
		this.storeSidebarComponent.selectOrders();
		this.storeOrdersPage = new StoreOrdersPage( driver );
		this.storeOrdersPage.clickFirstOrder();
		this.storeOrderDetailsPage = new StoreOrderDetailsPage( driver );
		this.storeOrderDetailsPage.clickFirstProduct();
		this.editProductPage = new AddEditProductPage( driver );
	} );
} );

test.describe( `Can see WooCommerce settings in Calypso '${ screenSize }' @parallel`, function() {
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

	test.it( 'Can see \'Settings\' option in the Woo store sidebar', function() {
		this.storeDashboardPage = new StoreDashboardPage( driver );
		this.storeSidebarComponent = new StoreSidebarComponent( driver );
		this.storeSidebarComponent.settingsLinkDisplayed().then( ( d ) => {
			assert( d, 'The store sidebar settings link is not displayed' );
		} );
	} );

	test.it( 'Can see the settings page when selecting the settings option in the Woo store sidebar', function() {
		this.storeDashboardPage = new StoreDashboardPage( driver );
		this.storeSidebarComponent = new StoreSidebarComponent( driver );
		this.storeSidebarComponent.selectSettings();
		this.storeSettingsPage = new StoreSettingsPage( driver );
	} );

	test.it( 'Can select payments, shipping, and taxes tabs on the settings page', function() {
		this.storeSidebarComponent = new StoreSidebarComponent( driver );
		this.storeSidebarComponent.selectSettings();
		this.storeSettingsPage = new StoreSettingsPage( driver );
		this.storeSettingsPage.selectPaymentsTab();
		this.storeSettingsPage.paymentsSettingsDisplayed().then( ( displayed ) => {
			assert( displayed, 'The payment settings were not displayed' );
		} );
		this.storeSettingsPage.selectShippingTab();
		this.storeSettingsPage.shippingSettingsDisplayed().then( ( displayed ) => {
			assert( displayed, 'The shipping settings were not displayed' );
		} );
		this.storeSettingsPage.selectTaxesTab();
		this.storeSettingsPage.taxesSettingsDisplayed().then( ( displayed ) => {
			assert( displayed, 'The taxes settings were not displayed' );
		} );
	} );
} );
