/** @format */

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
import NavBarComponent from '../lib/components/nav-bar-component.js';
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

test.before( async function() {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

test.describe( `[${ host }] Managing Domains: (${ screenSize }) @parallel`, function() {
	this.timeout( mochaTimeOut );

	test.describe( 'Adding a domain to an existing site ', function() {
		this.bailSuite( true );

		const blogName = dataHelper.getNewBlogName();
		const domainEmailAddress = dataHelper.getEmailAddress( blogName, domainsInboxId );
		const expectedDomainName = blogName + '.com';
		const testDomainRegistarDetails = dataHelper.getTestDomainRegistarDetails( domainEmailAddress );

		test.before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'Log In and Select Domains', async function() {
			return await new LoginFlow( driver ).loginAndSelectDomains();
		} );

		test.it( 'Can see the Domains page and choose add a domain', async function() {
			const domainsPage = new DomainsPage( driver );
			let urlDisplayed = await driver.getCurrentUrl();
			await domainsPage.setABTestControlGroupsInLocalStorage( urlDisplayed );
			return await domainsPage.clickAddDomain();
		} );

		test.it( 'Can see the domain search component', async function() {
			const findADomainComponent = await FindADomainComponent.Expect( driver );
			return await findADomainComponent.waitForResults();
		} );

		test.it( 'Can search for a blog name', async function() {
			const findADomainComponent = await FindADomainComponent.Expect( driver );
			return await findADomainComponent.searchForBlogNameAndWaitForResults( blogName );
		} );

		test.it(
			'Can select the .com search result and decline Google Apps for email',
			async function() {
				const findADomainComponent = await FindADomainComponent.Expect( driver );
				await findADomainComponent.selectDomainAddress( expectedDomainName );
				return await findADomainComponent.declineGoogleApps();
			}
		);

		test.it( 'Can see checkout page, choose privacy and enter registrar details', async function() {
			const checkOutPage = new CheckOutPage( driver );
			await checkOutPage.selectAddPrivacyProtectionCheckbox();
			await checkOutPage.enterRegistarDetails( testDomainRegistarDetails );
			return await checkOutPage.submitForm();
		} );

		test.it( 'Can then see secure payment component', async function() {
			return await SecurePaymentComponent.Expect( driver );
		} );

		test.after( async function() {
			// Empty the cart
			await ReaderPage.Visit( driver );
			const navBarComponent = await NavBarComponent.Expect( driver );
			await navBarComponent.clickMySites();
			await new StatsPage( driver, true ).displayed();
			await new SidebarComponent( driver ).selectDomains();
			await new DomainsPage( driver ).displayed();
			return await new ShoppingCartWidgetComponent( driver ).empty();
		} );
	} );

	test.describe( 'Map a domain to an existing site @parallel', function() {
		this.bailSuite( true );

		const blogName = 'myawesomedomain.com';

		test.before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'Log In and Select Domains', async function() {
			return await new LoginFlow( driver ).loginAndSelectDomains();
		} );

		test.it( 'Can see the Domains page and choose add a domain', async function() {
			const domainsPage = new DomainsPage( driver );
			let urlDisplayed = await driver.getCurrentUrl();
			await domainsPage.setABTestControlGroupsInLocalStorage( urlDisplayed );
			return await domainsPage.clickAddDomain();
		} );

		test.it( 'Can see the domain search component', async function() {
			const findADomainComponent = await FindADomainComponent.Expect( driver );
			return await findADomainComponent.waitForResults();
		} );

		test.it( 'Can select to use an existing domain', async function() {
			const findADomainComponent = await FindADomainComponent.Expect( driver );
			return await findADomainComponent.selectUseOwnDomain();
		} );

		test.it( 'Can see use my own domain page', async function() {
			return await MyOwnDomainPage.Expect( driver );
		} );

		test.it( 'Can select to manually connect existing domain component', async function() {
			const mapADomainComponent = await MapADomainComponent.Expect( driver );
			return await mapADomainComponent.selectManuallyConnectExistingDomain();
		} );

		test.it( 'Can see enter a domain component', async function() {
			return await MapADomainPage.Expect( driver );
		} );

		test.it( 'Can enter the domain name', async function() {
			return await new EnterADomainComponent( driver ).enterADomain( blogName );
		} );

		test.it( 'Can add domain to the cart', async function() {
			return await new EnterADomainComponent( driver ).clickonAddButtonToAddDomainToTheCart();
		} );

		test.it( 'Can see checkout page', async function() {
			return await new MapADomainCheckoutPage( driver ).displayed();
		} );

		test.after( async function() {
			// Empty the cart
			await ReaderPage.Visit( driver );
			const navBarComponent = await NavBarComponent.Expect( driver );
			await navBarComponent.clickMySites();
			await new StatsPage( driver, true ).displayed();
			await new SidebarComponent( driver ).selectDomains();
			await new DomainsPage( driver ).displayed();
			return await new ShoppingCartWidgetComponent( driver ).empty();
		} );
	} );
} );
