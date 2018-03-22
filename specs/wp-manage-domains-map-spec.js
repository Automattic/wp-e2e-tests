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

let driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `[${host}] Managing Domain Mapping: (${screenSize})`, function() {
	this.timeout( mochaTimeOut );

	test.describe( 'Map a domain to an existing site @parallel', function() {
		this.bailSuite( true );

		const blogName = 'myawesomedomain.com';

		test.before( function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'Log In and Select Domains', function() {
			return new LoginFlow( driver ).loginAndSelectDomains();
		} );

		test.it( 'Can see the Domains page and choose add a domain', function() {
			const domainsPage = new DomainsPage( driver );
			driver.getCurrentUrl().then( ( urlDisplayed ) => {
				domainsPage.setABTestControlGroupsInLocalStorage( urlDisplayed );
			} );
			return domainsPage.clickAddDomain();
		} );

		test.it( 'Can see the domain search component', function() {
			return new FindADomainComponent( driver ).waitForResults();
		} );

		test.it( 'Can select to use an existing domain', function() {
			return new FindADomainComponent( driver ).selectUseOwnDomain();
		} );

		test.it( 'Can see use my own domain page', function() {
			return new MyOwnDomainPage( driver ).displayed();
		} );

		test.it( 'Can select to manually connect existing domain component', function() {
			return new MapADomainComponent( driver ).selectManuallyConnectExistingDomain();
		} );

		test.it( 'Can see enter a domain component', function() {
			return new MapADomainPage( driver ).displayed();
		} );

		test.it( 'Can enter the domain name', function() {
			return new EnterADomainComponent( driver ).enterADomain( blogName );
		} );

		test.it( 'Can add domain to the cart', function() {
			return new EnterADomainComponent( driver ).clickonAddButtonToAddDomainToTheCart();
		} );

		test.it( 'Can see checkout page', function() {
			return new MapADomainCheckoutPage( driver ).displayed();
		} );

		test.after( function() { // Empty the cart
			new ReaderPage( driver, true ).displayed();
			new NavbarComponent( driver ).clickMySites();
			new StatsPage( driver, true ).displayed();
			new SidebarComponent( driver ).selectDomains();
			new DomainsPage( driver ).displayed();
			return new ShoppingCartWidgetComponent( driver ).empty();
		} );
	} );
} );
