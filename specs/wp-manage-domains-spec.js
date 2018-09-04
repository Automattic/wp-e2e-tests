/** @format */

import config from 'config';
import assert from 'assert';
import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper.js';

import WPHomePage from '../lib/pages/wp-home-page.js';
import DomainsPage from '../lib/pages/domains-page.js';
import CheckOutPage from '../lib/pages/signup/checkout-page.js';
import ReaderPage from '../lib/pages/reader-page.js';
import StatsPage from '../lib/pages/stats-page.js';

import FindADomainComponent from '../lib/components/find-a-domain-component.js';
import RegistrationUnavailableComponent from '../lib/components/domain-registration-unavailable-component';
import SecurePaymentComponent from '../lib/components/secure-payment-component.js';
import ShoppingCartWidgetComponent from '../lib/components/shopping-cart-widget-component.js';
import SidebarComponent from '../lib/components/sidebar-component.js';
import NavBarComponent from '../lib/components/nav-bar-component.js';
import MyOwnDomainPage from '../lib/pages/domain-my-own-page';
import MapADomainPage from '../lib/pages/domain-map-page';
import TransferDomainPage from '../lib/pages/transfer-domain-page';
import TransferDomainPrecheckPage from '../lib/pages/transfer-domain-precheck-page';
import EnterADomainComponent from '../lib/components/enter-a-domain-component';
import MapADomainCheckoutPage from '../lib/pages/domain-map-checkout-page';

import LoginFlow from '../lib/flows/login-flow.js';

import * as SlackNotifier from '../lib/slack-notifier';
import DomainDetailsPage from '../lib/pages/domain-details-page';
import CancelDomainPage from '../lib/pages/cancel-domain-page';
import ManagePurchasePage from '../lib/pages/manage-purchase-page';
import CancelPurchasePage from '../lib/pages/cancel-purchase-page';
import SideBarComponent from '../lib/components/sidebar-component';
import DomainOnlySettingsPage from '../lib/pages/domain-only-settings-page';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const domainsInboxId = config.get( 'domainsInboxId' );
const host = dataHelper.getJetpackHost();

let driver;

before( async function() {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] Managing Domains: (${ screenSize }) @parallel`, function() {
	this.timeout( mochaTimeOut );

	describe( 'Adding a domain to an existing site ', function() {
		const blogName = dataHelper.getNewBlogName();
		const domainEmailAddress = dataHelper.getEmailAddress( blogName, domainsInboxId );
		const expectedDomainName = blogName + '.com';
		const testDomainRegistarDetails = dataHelper.getTestDomainRegistarDetails( domainEmailAddress );

		before( async function() {
			if ( process.env.SKIP_DOMAIN_TESTS === 'true' ) {
				await SlackNotifier.warn(
					'Domains tests are currently disabled as SKIP_DOMAIN_TESTS is set to true',
					{ suppressDuplicateMessages: true }
				);
				return this.skip();
			}
		} );

		before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'Log In and Select Domains', async function() {
			return await new LoginFlow( driver ).loginAndSelectDomains();
		} );

		step( 'Can see the Domains page and choose add a domain', async function() {
			const domainsPage = await DomainsPage.Expect( driver );
			await domainsPage.setABTestControlGroupsInLocalStorage();
			return await domainsPage.clickAddDomain();
		} );

		step( 'Can see the domain search component', async function() {
			let findADomainComponent;
			try {
				findADomainComponent = await FindADomainComponent.Expect( driver );
			} catch ( err ) {
				if ( await RegistrationUnavailableComponent.Expect( driver ) ) {
					await SlackNotifier.warn( 'SKIPPING: Domain registration is currently unavailable. ', {
						suppressDuplicateMessages: true,
					} );
					return this.skip();
				}
			}
			return await findADomainComponent.waitForResults();
		} );

		step( 'Can search for a blog name', async function() {
			const findADomainComponent = await FindADomainComponent.Expect( driver );
			return await findADomainComponent.searchForBlogNameAndWaitForResults( blogName );
		} );

		step( 'Can select the .com search result and decline Google Apps for email', async function() {
			const findADomainComponent = await FindADomainComponent.Expect( driver );
			await findADomainComponent.selectDomainAddress( expectedDomainName );
			return await findADomainComponent.declineGoogleApps();
		} );

		step( 'Can see checkout page, choose privacy and enter registrar details', async function() {
			const checkOutPage = await CheckOutPage.Expect( driver );
			await checkOutPage.selectAddPrivacyProtectionCheckbox();
			await checkOutPage.enterRegistarDetails( testDomainRegistarDetails );
			return await checkOutPage.submitForm();
		} );

		step( 'Can then see secure payment component', async function() {
			return await SecurePaymentComponent.Expect( driver );
		} );

		step( 'Empty the cart', async function() {
			await ReaderPage.Visit( driver );
			const navBarComponent = await NavBarComponent.Expect( driver );
			await navBarComponent.clickMySites();
			await StatsPage.Expect( driver );
			const sidebarComponent = await SidebarComponent.Expect( driver );
			await sidebarComponent.selectDomains();
			await DomainsPage.Expect( driver );
			const shoppingCartWidgetComponent = await ShoppingCartWidgetComponent.Expect( driver );
			return await shoppingCartWidgetComponent.empty();
		} );
	} );

	describe( 'Map a domain to an existing site @parallel', function() {
		const blogName = 'myawesomedomain.com';

		before( async function() {
			if ( process.env.SKIP_DOMAIN_TESTS === 'true' ) {
				await SlackNotifier.warn(
					'Domains tests are currently disabled as SKIP_DOMAIN_TESTS is set to true',
					{ suppressDuplicateMessages: true }
				);
				return this.skip();
			}
		} );

		before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'Log In and Select Domains', async function() {
			return await new LoginFlow( driver ).loginAndSelectDomains();
		} );

		step( 'Can see the Domains page and choose add a domain', async function() {
			const domainsPage = await DomainsPage.Expect( driver );
			await domainsPage.setABTestControlGroupsInLocalStorage();
			return await domainsPage.clickAddDomain();
		} );

		step( 'Can see the domain search component', async function() {
			let findADomainComponent;
			try {
				findADomainComponent = await FindADomainComponent.Expect( driver );
			} catch ( err ) {
				if ( await RegistrationUnavailableComponent.Expect( driver ) ) {
					await SlackNotifier.warn( 'SKIPPING: Domain registration is currently unavailable. ', {
						suppressDuplicateMessages: true,
					} );
					return this.skip();
				}
			}
			return await findADomainComponent.waitForResults();
		} );

		step( 'Can select to use an existing domain', async function() {
			const findADomainComponent = await FindADomainComponent.Expect( driver );
			return await findADomainComponent.selectUseOwnDomain();
		} );

		step( 'Can see use my own domain page', async function() {
			return await MyOwnDomainPage.Expect( driver );
		} );

		step( 'Can select to buy domain mapping', async function() {
			const myOwnDomainPage = await MyOwnDomainPage.Expect( driver );
			return await myOwnDomainPage.selectBuyDomainMapping();
		} );

		step( 'Can see enter a domain component', async function() {
			return await MapADomainPage.Expect( driver );
		} );

		step( 'Can enter the domain name', async function() {
			const enterADomainComponent = await EnterADomainComponent.Expect( driver );
			return await enterADomainComponent.enterADomain( blogName );
		} );

		step( 'Can add domain to the cart', async function() {
			const enterADomainComponent = await EnterADomainComponent.Expect( driver );
			return await enterADomainComponent.clickonAddButtonToAddDomainToTheCart();
		} );

		step( 'Can see checkout page', async function() {
			return await MapADomainCheckoutPage.Expect( driver );
		} );

		step( 'Empty the cart', async function() {
			await ReaderPage.Visit( driver );
			const navBarComponent = await NavBarComponent.Expect( driver );
			await navBarComponent.clickMySites();
			await StatsPage.Expect( driver );
			const sideBarComponent = await SidebarComponent.Expect( driver );
			await sideBarComponent.selectDomains();
			await DomainsPage.Expect( driver );
			const shoppingCartWidgetComponent = await ShoppingCartWidgetComponent.Expect( driver );
			return await shoppingCartWidgetComponent.empty();
		} );
	} );

	describe( 'Transfer a domain to an existing site (partial) @parallel', function() {
		const domain = 'automattic.com';

		before( async function() {
			if ( process.env.SKIP_DOMAIN_TESTS === 'true' ) {
				await SlackNotifier.warn(
					'Domains tests are currently disabled as SKIP_DOMAIN_TESTS is set to true',
					{ suppressDuplicateMessages: true }
				);
				return this.skip();
			}
		} );

		before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'Log In and Select Domains', async function() {
			return await new LoginFlow( driver ).loginAndSelectDomains();
		} );

		step( 'Can see the Domains page and choose add a domain', async function() {
			const domainsPage = await DomainsPage.Expect( driver );
			await domainsPage.setABTestControlGroupsInLocalStorage();
			return await domainsPage.clickAddDomain();
		} );

		step( 'Can see the domain search component', async function() {
			let findADomainComponent;
			try {
				findADomainComponent = await FindADomainComponent.Expect( driver );
			} catch ( err ) {
				if ( await RegistrationUnavailableComponent.Expect( driver ) ) {
					await SlackNotifier.warn( 'SKIPPING: Domain registration is currently unavailable. ', {
						suppressDuplicateMessages: true,
					} );
					return this.skip();
				}
			}
			return await findADomainComponent.waitForResults();
		} );

		step( 'Can select to use an existing domain', async function() {
			const findADomainComponent = await FindADomainComponent.Expect( driver );
			return await findADomainComponent.selectUseOwnDomain();
		} );

		step( 'Can see use my own domain page', async function() {
			return await MyOwnDomainPage.Expect( driver );
		} );

		step( 'Can select to transfer a domain', async function() {
			const myOwnDomainPage = await MyOwnDomainPage.Expect( driver );
			return await myOwnDomainPage.selectTransferDomain();
		} );

		step( 'Can see the transfer my domain page', async function() {
			return await TransferDomainPage.Expect( driver );
		} );

		step( 'Can enter the domain name', async function() {
			const transferDomainPage = await TransferDomainPage.Expect( driver );
			return await transferDomainPage.enterADomain( domain );
		} );

		step( 'Click transfer domain button', async function() {
			const transferDomainPage = await TransferDomainPage.Expect( driver );
			return await transferDomainPage.clickTransferDomain();
		} );

		step( 'Can see the transfer precheck page', async function() {
			return await TransferDomainPrecheckPage.Expect( driver );
		} );
	} );

	describe.only( 'Register (and cancel) .live domain to an existing site ', function() {
		const blogName = dataHelper.getNewBlogName();
		const domainEmailAddress = 'toptest.gfwjyx9f@mailosaur.io';
		const expectedDomainName = blogName + '.live';
		const testDomainRegistarDetails = dataHelper.getTestDomainRegistarDetails( domainEmailAddress );

		before( async function() {
			if ( process.env.SKIP_DOMAIN_TESTS === 'true' ) {
				await SlackNotifier.warn(
					'Domains tests are currently disabled as SKIP_DOMAIN_TESTS is set to true',
					{ suppressDuplicateMessages: true }
				);
				return this.skip();
			}
		} );

		before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'We can visit set the sandbox cookie for payments', async function() {
			const locale = driverManager.currentLocale();
			const sandboxCookieValue = config.get( 'storeSandboxCookieValue' );
			const currencyValue = 'AUD';

			const wPHomePage = await WPHomePage.Visit( driver );
			await wPHomePage.checkURL( locale );
			await wPHomePage.setSandboxModeForPayments( sandboxCookieValue );
			return await wPHomePage.setCurrencyForPayments( currencyValue );
		} );

		step( 'Log In and Select Domains', async function() {
			// return await new LoginFlow( driver, 'addLiveDomainUser' ).loginAndSelectDomains();
			return await new LoginFlow( driver ).loginAndSelectDomains();
		} );

		step( 'Can see the Domains page and choose add a domain', async function() {
			const domainsPage = await DomainsPage.Expect( driver );
			await domainsPage.setABTestControlGroupsInLocalStorage();
			return await domainsPage.clickAddDomain();
		} );

		step( 'Can see the domain search component', async function() {
			let findADomainComponent;
			try {
				findADomainComponent = await FindADomainComponent.Expect( driver );
			} catch ( err ) {
				if ( await RegistrationUnavailableComponent.Expect( driver ) ) {
					await SlackNotifier.warn( 'SKIPPING: Domain registration is currently unavailable. ', {
						suppressDuplicateMessages: true,
					} );
					return this.skip();
				}
			}
			return await findADomainComponent.waitForResults();
		} );

		step( 'Can search for a blog name', async function() {
			const findADomainComponent = await FindADomainComponent.Expect( driver );
			return await findADomainComponent.searchForBlogNameAndWaitForResults( expectedDomainName );
		} );

		step( 'Can select the .live search result and decline Google Apps for email', async function() {
			const findADomainComponent = await FindADomainComponent.Expect( driver );
			await findADomainComponent.selectDomainAddress( expectedDomainName );
			return await findADomainComponent.declineGoogleApps();
		} );

		step(
			'Can see checkout page, choose domain privacy option and enter registrar details',
			async function() {
				let checkOutPage;
				try {
					checkOutPage = await CheckOutPage.Expect( driver );
				} catch ( err ) {
					//TODO: Check this code once more when domain registration is not available
					const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
					let numberOfItems = await securePaymentComponent.numberOfProductsInCart();
					if ( numberOfItems === 0 ) {
						await SlackNotifier.warn(
							'OOPS! Something went wrong! Check if domains registrations is available.'
						);
						return this.skip();
					}
				}
				// await checkOutPage.selectAddPrivacyProtectionCheckbox();
				await checkOutPage.enterRegistarDetails( testDomainRegistarDetails );
				return await checkOutPage.submitForm();
			}
		);

		// step(
		// 	'Can then see the secure payment page with the correct products in the cart',
		// 	async function() {
		// 		const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
		// 		const domainInCart = await securePaymentComponent.containsDotLiveDomain();
		// 		assert.strictEqual(
		// 			domainInCart,
		// 			true,
		// 			"The cart doesn't contain the .live domain product"
		// 		);
		// 		const privateWhoISInCart = await securePaymentComponent.containsPrivateWhois();
		// 		assert.strictEqual(
		// 			privateWhoISInCart,
		// 			true,
		// 			"The cart doesn't contain the private domain product"
		// 		);
		// 		const numberOfProductsInCart = await securePaymentComponent.numberOfProductsInCart();
		// 		return assert.strictEqual(
		// 			numberOfProductsInCart,
		// 			2,
		// 			"The cart doesn't contain the expected number of products"
		// 		);
		// 	}
		// );

		// step(
		// 	'Can then see the secure payment page with the expected currency in the cart',
		// 	async function() {
		// 		const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
		// 		if ( driverManager.currentScreenSize() === 'desktop' ) {
		// 			const totalShown = await securePaymentComponent.cartTotalDisplayed();
		// 			assert.strictEqual(
		// 				totalShown.indexOf( expectedCurrencySymbol ),
		// 				0,
		// 				`The cart total '${ totalShown }' does not begin with '${ expectedCurrencySymbol }'`
		// 			);
		// 		}
		// 		const paymentButtonText = await securePaymentComponent.paymentButtonText();
		// 		return assert(
		// 			paymentButtonText.includes( expectedCurrencySymbol ),
		// 			`The payment button text '${ paymentButtonText }' does not contain the expected currency symbol: '${ expectedCurrencySymbol }'`
		// 		);
		// 	}
		// );

		step( 'Can enter/submit test payment details', async function() {
			const testCreditCardDetails = dataHelper.getTestCreditCardDetails();
			const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
			await securePaymentComponent.enterTestCreditCardDetails( testCreditCardDetails );
			await securePaymentComponent.submitPaymentDetails();
			await securePaymentComponent.waitForCreditCardPaymentProcessing();
			return await securePaymentComponent.waitForPageToDisappear();
		} );

		step( 'Can open the sidebar', async function() {
			const navBarComponent = await NavBarComponent.Expect( driver );
			return await navBarComponent.clickMySites();
		} );

		step( 'We can cancel the domain', async function() {
			return ( async () => {
				await ReaderPage.Visit( driver );
				const navBarComponent = await NavBarComponent.Expect( driver );
				await navBarComponent.clickMySites();
				const sidebarComponent = await SideBarComponent.Expect( driver );
				await sidebarComponent.selectSettings();
				const domainOnlySettingsPage = await DomainOnlySettingsPage.Expect( driver );
				await domainOnlySettingsPage.manageDomain();
				const domainDetailsPage = await DomainDetailsPage.Expect( driver );
				await domainDetailsPage.viewPaymentSettings();

				const managePurchasePage = await ManagePurchasePage.Expect( driver );
				let domainDisplayed = await managePurchasePage.domainDisplayed();
				assert.strictEqual(
					domainDisplayed,
					expectedDomainName,
					'The domain displayed on the manage purchase page is unexpected'
				);
				await managePurchasePage.chooseCancelAndRefund();

				const cancelPurchasePage = await CancelPurchasePage.Expect( driver );
				await cancelPurchasePage.clickCancelPurchase();

				const cancelDomainPage = await CancelDomainPage.Expect( driver );
				return await cancelDomainPage.completeSurveyAndConfirm();
			} )().catch( err => {
				SlackNotifier.warn(
					`There was an error in the hooks that clean up the test account but since it is cleaning up we really don't care: '${ err }'`,
					{ suppressDuplicateMessages: true }
				);
			} );
		} );
	} );
} );
