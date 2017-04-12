import assert from 'assert';
import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager';

import StorePage from '../lib/pages/woocommerce/store-page';
import AddProductPage from '../lib/pages/woocommerce/add-product-page';
import StoreStatsPage from '../lib/pages/woocommerce/store-stats-page';

import LoginFlow from '../lib/flows/login-flow';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

let driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `WooCommerce on Calypso: '${ screenSize }'`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.before( function() {
		driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	// Login as WooCommerce store user
	test.before( function() {
		this.loginFlow = new LoginFlow( driver, 'wooCommerceUser' );
		this.loginFlow.loginAndSelectMySite();
	} );

	test.it( 'Can see store placeholder page when visiting /store', function() {
		this.storePage = new StorePage( driver, true );
		this.storePage.displayed().then( ( shown ) => {
			assert( shown, 'Could not see the WooCommerce store page after visting /store' );
		} );
	} );

	test.it( 'Can see the add product placeholder page when visiting /store/products/add', function() {
		this.addProductPage = new AddProductPage( driver, true );
		this.addProductPage.displayed().then( ( shown ) => {
			assert( shown, 'Could not see the WooCommerce add product page after visting /store/products/add' );
		} );
	} );

	test.it( 'Can see the add store stats placeholder page when visiting /store/stats', function() {
		this.storeStatsPage = new StoreStatsPage( driver, true );
		this.storeStatsPage.displayed().then( ( shown ) => {
			assert( shown, 'Could not see the WooCommerce add product page after visting /store/stats' );
		} );
	} );
} );
