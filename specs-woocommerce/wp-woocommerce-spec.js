/** @format */

import assert from 'assert';
import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager';
import * as mediaHelper from '../lib/media-helper';
import * as dataHelper from '../lib/data-helper';

import NavBarComponent from '../lib/components/navbar-component';
import SidebarComponent from '../lib/components/sidebar-component';
import StoreSidebarComponent from '../lib/components/store-sidebar-component';
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

test.before( async function() {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

test.describe(
	`Can see WooCommerce Store option in Calypso '${ screenSize }' @parallel`,
	function() {
		this.timeout( mochaTimeOut );
		this.bailSuite( true );

		test.before( async function() {
			await driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		// Login as WooCommerce store user and open the sidebar
		test.before( async function() {
			this.loginFlow = new LoginFlow( driver, 'wooCommerceUser' );
			await this.loginFlow.login();
			this.navBarComponent = await NavBarComponent.Expect( driver );
			await this.navBarComponent.clickMySites();
		} );

		test.it(
			"Can see 'Store' option in main Calypso menu for an AT WooCommerce site set to the US",
			async function() {
				this.sideBarComponent = new SidebarComponent( driver );
				let displayed = await this.sideBarComponent.storeOptionDisplayed();
				assert(
					displayed,
					'The Store menu option is not displayed for the AT WooCommerce site set to the US'
				);
			}
		);

		test.it( "The 'Store' option opens the store dashboard with its own sidebar", async function() {
			this.sideBarComponent = new SidebarComponent( driver );
			await this.sideBarComponent.selectStoreOption();
			this.storeSidebarComponent = new StoreSidebarComponent( driver );
			let d = await this.storeSidebarComponent.displayed();
			assert( d, 'The store sidebar is not displayed' );
		} );
	}
);

test.describe( `Can see WooCommerce products in Calypso '${ screenSize }' @parallel`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.before( async function() {
		await driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	// Login as WooCommerce store user and open the woo store
	test.before( async function() {
		this.loginFlow = new LoginFlow( driver, 'wooCommerceUser' );
		return await this.loginFlow.loginAndOpenWooStore();
	} );

	test.it( "Can see 'Products' option in the Woo store sidebar", async function() {
		this.storeSidebarComponent = new StoreSidebarComponent( driver );
		let d = await this.storeSidebarComponent.productsLinkDisplayed();
		assert( d, 'The store sidebar products link is not displayed' );
	} );

	test.it(
		'Can see the products page with at least one product when selecting the products option in the Woo store sidebar',
		async function() {
			this.storeSidebarComponent = new StoreSidebarComponent( driver );
			await this.storeSidebarComponent.selectProducts();
			this.storeProductsPage = new StoreProductsPage( driver );
			let displayed = await this.storeProductsPage.atLeastOneProductDisplayed();
			assert( displayed, 'No Woo products are displayed on the product page' );
		}
	);
} );

test.describe(
	`Can add a new WooCommerce product in Calypso '${ screenSize }' @parallel`,
	function() {
		this.timeout( mochaTimeOut );
		this.bailSuite( true );
		let fileDetails;

		test.before( async function() {
			await driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		// 'Create image file for upload'
		test.before( async function() {
			fileDetails = await mediaHelper.createFile( false, 'image-uploads-store' );
		} );

		// Login as WooCommerce store user and open the woo store
		test.before( async function() {
			this.loginFlow = new LoginFlow( driver, 'wooCommerceUser' );
			return await this.loginFlow.loginAndOpenWooStore();
		} );

		test.it(
			'Can add a new product via the Products Menu in the Woo store sidebar',
			async function() {
				const productTitle = dataHelper.randomPhrase();
				const productDescription = 'Another test e2e product';
				this.storeSidebarComponent = new StoreSidebarComponent( driver );
				await this.storeSidebarComponent.addProduct();
				this.addProductPage = new AddEditProductPage( driver );
				await this.addProductPage.enterTitle( productTitle );
				// this.addProductPage.addImage( fileDetails );
				await this.addProductPage.enterDescription( productDescription );
				await this.addProductPage.setPrice( '888.00' );
				await this.addProductPage.setDimensions( '6', '7', '8' );
				await this.addProductPage.setWeight( '2.2' );
				await this.addProductPage.addQuantity( '80' );
				await this.addProductPage.allowBackorders();
				await this.addProductPage.addCategory( 'Art' ); //Adding a category at the end to prevent errors being thrown on save
				await this.addProductPage.saveAndPublish();
				await this.addProductPage.waitForSuccessNotice();
				this.storeProductsPage = new StoreProductsPage( driver );
				let displayed = await this.storeProductsPage.productDisplayed( productTitle );
				assert(
					displayed,
					`The product '${ productTitle }' isn't being displayed on the products page after being added`
				);
				await this.storeProductsPage.selectProduct( productTitle );
				this.editProductPage = new AddEditProductPage( driver );
				await this.editProductPage.deleteProduct();
				await this.editProductPage.waitForSuccessNotice();
				this.storeProductsPage = new StoreProductsPage( driver );
				displayed = await this.storeProductsPage.productDisplayed( productTitle );
				assert(
					! displayed,
					`The product '${ productTitle }' isn't still being displayed on the products page after being deleted`
				);
			}
		);

		test.after( async function() {
			if ( fileDetails ) {
				await mediaHelper.deleteFile( fileDetails );
			}
		} );
	}
);

test.describe( `Can see WooCommerce orders in Calypso '${ screenSize }' @parallel`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.before( async function() {
		await driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	// Login as WooCommerce store user and open the woo store
	test.before( async function() {
		this.loginFlow = new LoginFlow( driver, 'wooCommerceUser' );
		return await this.loginFlow.loginAndOpenWooStore();
	} );

	test.it( "Can see 'Orders' option in the Woo store sidebar", async function() {
		this.storeSidebarComponent = new StoreSidebarComponent( driver );
		let d = await this.storeSidebarComponent.productsLinkDisplayed();
		assert( d, 'The store sidebar orders link is not displayed' );
	} );

	test.it(
		'Can see the orders page with at least one order when selecting the orders option in the Woo store sidebar',
		async function() {
			this.storeSidebarComponent = new StoreSidebarComponent( driver );
			await this.storeSidebarComponent.selectOrders();
			this.storeOrdersPage = new StoreOrdersPage( driver );
			let displayed = await this.storeOrdersPage.atLeastOneOrderDisplayed();
			assert( displayed, 'No Woo orders are displayed on the orders page' );
		}
	);

	test.it(
		'Can see the order details page when opening an order, product details page when clicking a product in an order',
		async function() {
			this.storeSidebarComponent = new StoreSidebarComponent( driver );
			await this.storeSidebarComponent.selectOrders();
			this.storeOrdersPage = new StoreOrdersPage( driver );
			await this.storeOrdersPage.clickFirstOrder();
			this.storeOrderDetailsPage = new StoreOrderDetailsPage( driver );
			await this.storeOrderDetailsPage.clickFirstProduct();
			this.editProductPage = new AddEditProductPage( driver );
		}
	);
} );

test.describe( `Can see WooCommerce settings in Calypso '${ screenSize }' @parallel`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.before( async function() {
		await driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	// Login as WooCommerce store user and open the woo store
	test.before( async function() {
		this.loginFlow = new LoginFlow( driver, 'wooCommerceUser' );
		return await this.loginFlow.loginAndOpenWooStore();
	} );

	test.it( "Can see 'Settings' option in the Woo store sidebar", async function() {
		this.storeSidebarComponent = new StoreSidebarComponent( driver );
		let d = await this.storeSidebarComponent.settingsLinkDisplayed();
		assert( d, 'The store sidebar settings link is not displayed' );
	} );

	test.it(
		'Can see the settings page when selecting the settings option in the Woo store sidebar',
		async function() {
			this.storeSidebarComponent = new StoreSidebarComponent( driver );
			await this.storeSidebarComponent.selectSettings();
		}
	);

	test.it( 'Can select payments, shipping, and taxes tabs on the settings page', async function() {
		this.storeSidebarComponent = new StoreSidebarComponent( driver );
		await this.storeSidebarComponent.selectSettings();
		this.storeSettingsPage = new StoreSettingsPage( driver );
		await this.storeSettingsPage.selectPaymentsTab();
		let displayed = await this.storeSettingsPage.paymentsSettingsDisplayed();
		assert( displayed, 'The payment settings were not displayed' );
		await this.storeSettingsPage.selectShippingTab();
		displayed = await this.storeSettingsPage.shippingSettingsDisplayed();
		assert( displayed, 'The shipping settings were not displayed' );
		await this.storeSettingsPage.selectTaxesTab();
		displayed = await this.storeSettingsPage.taxesSettingsDisplayed();
		assert( displayed, 'The taxes settings were not displayed' );
	} );
} );
