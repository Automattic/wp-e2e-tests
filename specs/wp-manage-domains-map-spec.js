import assert from 'assert';
import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper.js';

import LoginFlow from '../lib/flows/login-flow.js';
import DomainsPage from '../lib/pages/domains-page';
import ShoppingCartWidgetComponent from '../lib/components/shopping-cart-widget-component';
import SidebarComponent from '../lib/components/sidebar-component';
import NavbarComponent from '../lib/components/navbar-component';
import StatsPage from '../lib/pages/stats-page';
import ReaderPage from '../lib/pages/reader-page';
import FindADomainComponent from '../lib/components/find-a-domain-component';
import MyOwnDomainPage from '../lib/pages/domain-my-own-page';
import MapADomainComponent from '../lib/components/map-a-domain-component';
import MapADomainPage from '../lib/pages/domain-map-page';
import EnterADomainComponent from '../lib/components/enter-a-domain-component';
import MapADomainCheckoutPage from '../lib/pages/domain-map-checkout-page';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

var driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `[${host}] Managing Domain Mapping: (${screenSize}) @parallel`, function() {
	this.bailSuite( true );
	this.timeout( mochaTimeOut );

	test.describe( 'Map a domain to an existing site', () => {
		this.bailSuite( true );

		const blogName = dataHelper.getNewBlogName();

		test.before( function() {
			driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.it( 'Log In and Select Domains', () => {
			const loginFlow = new LoginFlow( driver );
			loginFlow.loginAndSelectDomains();
		} );

		test.describe( 'Can find domain mapping section and enter a domain to map', function() {
			test.it( 'Can choose add a domain', () => {
				const domainsPage = new DomainsPage( driver );
				driver.getCurrentUrl().then( ( urlDisplayed ) => {
					domainsPage.setABTestControlGroupsInLocalStorage( urlDisplayed );
				} );
				return domainsPage.clickAddDomain();
			} );

			test.it( 'Can see the domain search component', () => {
				const findADomainComponent = new FindADomainComponent( driver );
				findADomainComponent.waitForResults();
			} );

			test.it( 'Can select to use an existing domain', () => {
				const findADomainComponent = new FindADomainComponent( driver );
				findADomainComponent.selectUseOwnDomain();
			} );

			test.it( 'Can see use my own domain page', () => {
				const myOwnDomainPage = new MyOwnDomainPage( driver );
				myOwnDomainPage.displayed().then( ( displayed ) => {
					assert.equal( displayed, true, 'Could not see use my own domain page' );
				} );
			} );

			test.it( 'Can select to manually connect existing domain component', () => {
				const mapADomainComponent = new MapADomainComponent( driver );
				mapADomainComponent.selectManuallyConnectExistingDomain();
			} );

			test.it( 'Can see enter a domain component', () => {
				const mapADomainPage = new MapADomainPage( driver );
				mapADomainPage.displayed().then( ( displayed ) => {
					assert.equal( displayed, true, 'Could not see map a domain page' );
				} );

			} );

			test.it( 'Can enter the domain name', () => {
				const enterADomainComponent = new EnterADomainComponent( driver );
				enterADomainComponent.enterADomain( blogName );
			} );

			test.it( 'Can add domain to the cart', () => {
				const enterADomainComponent = new EnterADomainComponent( driver );
				enterADomainComponent.clickonAddButtonToAddDomainToTheCart();
			} );

			test.describe( 'Can pay for domain mapping', function() {
				test.it( 'Can see checkout page', () => {
					const mapADomainCheckoutPage = new MapADomainCheckoutPage( driver );
					mapADomainCheckoutPage.displayed().then( ( displayed ) => {
						assert.equal( displayed, true, 'Could not see the secure payment component' );
					} );
				} );

				// Remove all items from basket for clean up
				test.it( 'Can empty cart for next test', () => {
					this.readerPage = new ReaderPage( driver, true );

					this.navbarComponent = new NavbarComponent( driver );
					this.navbarComponent.clickMySites();

					this.statsPage = new StatsPage( driver, true );

					this.sideBarComponent = new SidebarComponent( driver );
					this.sideBarComponent.selectDomains();

					this.domainsPage = new DomainsPage( driver );
					this.shoppingCartWidgetComponent = new ShoppingCartWidgetComponent( driver );
					return this.shoppingCartWidgetComponent.empty();
				} );
			} );
		} );
	} );
} );
