import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper.js';

import DomainsPage from '../lib/pages/domains-page.js';
import CheckOutPage from '../lib/pages/signup/checkout-page.js';
import ReaderPage from '../lib/pages/reader-page.js';
import StatsPage from '../lib/pages/stats-page.js';

import FindADomainComponent from '../lib/components/find-a-domain-component.js';
import SecurePaymentComponent from '../lib/components/secure-payment-component.js';
import ShoppingCartWidgetComponent from '../lib/components/shopping-cart-widget-component.js';
import SidebarComponent from '../lib/components/sidebar-component.js';
import NavbarComponent from '../lib/components/navbar-component.js';
import MyOwnDomainPage from '../lib/pages/domain-my-own-page';
import MapADomainComponent from '../lib/components/map-a-domain-component';
import MapADomainPage from '../lib/pages/domain-map-page';
import EnterADomainComponent from '../lib/components/enter-a-domain-component';
import MapADomainCheckoutPage from '../lib/pages/domain-map-checkout-page';

import LoginFlow from '../lib/flows/login-flow.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const domainsInboxId = config.get( 'domainsInboxId' );
const host = dataHelper.getJetpackHost();

let driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `[${host}] Managing Domains: (${screenSize}) @parallel`, function() {
	this.timeout( mochaTimeOut );

	test.describe( 'Adding a domain to an existing site ', function() {
		this.bailSuite( true );

		const blogName = dataHelper.getNewBlogName();
		const domainEmailAddress = dataHelper.getEmailAddress( blogName, domainsInboxId );
		const expectedDomainName = blogName + '.com';
		const testDomainRegistarDetails = dataHelper.getTestDomainRegistarDetails( domainEmailAddress );

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

		test.it( 'Can search for a blog name', function() {
			return new FindADomainComponent( driver ).searchForBlogNameAndWaitForResults( blogName );
		} );

		test.it( 'Can select the .com search result and decline Google Apps for email', function() {
			const findADomainComponent = new FindADomainComponent( driver );
			findADomainComponent.selectDomainAddress( expectedDomainName );
			return findADomainComponent.declineGoogleApps();
		} );

		test.it( 'Can see checkout page, choose privacy and enter registrar details', function() {
			const checkOutPage = new CheckOutPage( driver );
			checkOutPage.selectAddPrivacyProtectionCheckbox();
			checkOutPage.enterRegistarDetails( testDomainRegistarDetails );
			return checkOutPage.submitForm();
		} );

		test.it( 'Can then see secure payment component', function() {
			return new SecurePaymentComponent( driver ).displayed();
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
