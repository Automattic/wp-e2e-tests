import assert from 'assert';
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

import LoginFlow from '../lib/flows/login-flow.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const domainsInboxId = config.get( 'domainsInboxId' );
const host = dataHelper.getJetpackHost();

const expect = require( 'chai' ).expect;

const bluecat = require( 'bluecat' );

const oauth = require( '../lib/wpcom-api/oauth.js' );

const api = bluecat.Api( 'wp' );
api.oauth2.host = 'https://public-api.wordpress.com';
const service = new bluecat.ServiceSync( api, 'public-api.wordpress.com/rest/v1.1' );

// Test account for the API
const account = config.testAccounts.defaultUser;

var driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `[${host}] Managing Domains: (${screenSize}) @parallel`, function() {
	this.bailSuite( true );
	this.timeout( mochaTimeOut );

	test.describe( 'Partially adding a domain to an existing site (Doesn\'t work in full until we work out a way to cancel the domain automatically)', () => {
		this.bailSuite( true );

		//TODO: work out about sandbox payments and automatically cancelling domains
		const blogName = dataHelper.getNewBlogName();
		const domainEmailAddress = dataHelper.getEmailAddress( blogName, domainsInboxId );
		const expectedDomainName = blogName + '.com';
		const firstName = 'End to End';
		const lastName = 'Testing';
		const phoneNumber = '0422 888 888';
		const countryCode = 'AU';
		const address = '888 Queen Street';
		const city = 'Brisbane';
		const stateCode = 'QLD';
		const postalCode = '4000';

		test.before( function() {
			driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.it( 'Log In and Select Domains', () => {
			const loginFlow = new LoginFlow( driver );
			loginFlow.loginAndSelectDomains();
		} );

		test.describe( 'Can search for and select a paid domain', function() {
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
			test.it( 'Can search for a blog name', () => {
				const findADomainComponent = new FindADomainComponent( driver );
				findADomainComponent.searchForBlogNameAndWaitForResults( blogName );
			} );
			test.it( 'Can select the .com search result and decline Google Apps for email', () => {
				const findADomainComponent = new FindADomainComponent( driver );
				findADomainComponent.selectDotComAddress( expectedDomainName );
				findADomainComponent.declineGoogleApps();
			} );

			test.describe( 'Can pay for domain', function() {
				test.it( 'Can see checkout page', () => {
					const checkOutPage = new CheckOutPage( driver );
					checkOutPage.displayed().then( ( displayed ) => {
						assert.equal( displayed, true, 'Could not see the check out page' );
					} );
				} );

				test.it( 'Can choose domain privacy option', () => {
					const checkOutPage = new CheckOutPage( driver );
					checkOutPage.selectAddPrivacyProtectionCheckbox();
				} );

				test.it( 'Can enter domain registrar details', () => {
					const checkOutPage = new CheckOutPage( driver );
					checkOutPage.enterRegistarDetails( firstName, lastName, domainEmailAddress, phoneNumber, countryCode, address, city, stateCode, postalCode );
					checkOutPage.submitForm();
				} );

				test.it( 'Can then see secure payment component', () => {
					const securePaymentComponent = new SecurePaymentComponent( driver );
					securePaymentComponent.displayed().then( ( displayed ) => {
						assert.equal( displayed, true, 'Could not see the secure payment component' );
					} );
				} );

				// Remove all items from basket for clean up
				test.it( 'Can empty cart for next test', ( done ) => {
					return service.run( function() {
						oauth.login( service, account );
						let res = service.sites['${site}']['shopping-cart'].clear.POST( {
							params: { site: account[2] }
						} );
						expect( res.data.statusCode ).to.equal( 200 );
						done();
					} );
				} );
			} );
		} );
	} );
} );
