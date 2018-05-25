/** @format */

import test from 'selenium-webdriver/testing';
import config from 'config';
import assert from 'assert';

import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper.js';
import * as eyesHelper from '../lib/eyes-helper.js';

import WPHomePage from '../lib/pages/wp-home-page.js';
import ChooseAThemePage from '../lib/pages/signup/choose-a-theme-page.js';
import StartPage from '../lib/pages/signup/start-page.js';
import AboutPage from '../lib/pages/signup/about-page.js';
import DomainFirstPage from '../lib/pages/signup/domain-first-page';
import PickAPlanPage from '../lib/pages/signup/pick-a-plan-page.js';
import CreateYourAccountPage from '../lib/pages/signup/create-your-account-page.js';
import SignupProcessingPage from '../lib/pages/signup/signup-processing-page.js';
import CheckOutPage from '../lib/pages/signup/checkout-page';
import CheckOutThankyouPage from '../lib/pages/signup/checkout-thankyou-page.js';
import ViewBlogPage from '../lib/pages/signup/view-blog-page.js';
import LoginPage from '../lib/pages/login-page';
import MagicLoginPage from '../lib/pages/magic-login-page';
import ReaderPage from '../lib/pages/reader-page';
import DomainOnlySettingsPage from '../lib/pages/domain-only-settings-page';
import DomainDetailsPage from '../lib/pages/domain-details-page';
import ProfilePage from '../lib/pages/profile-page';
import PurchasesPage from '../lib/pages/purchases-page';
import ManagePurchasePage from '../lib/pages/manage-purchase-page';
import CancelPurchasePage from '../lib/pages/cancel-purchase-page';
import CancelDomainPage from '../lib/pages/cancel-domain-page';
import GSuiteUpsellPage from '../lib/pages/gsuite-upsell-page';

import FindADomainComponent from '../lib/components/find-a-domain-component.js';
import SecurePaymentComponent from '../lib/components/secure-payment-component.js';
import NavBarComponent from '../lib/components/navbar-component';
import SideBarComponent from '../lib/components/sidebar-component';
import SignupStepComponent from '../lib/components/signup-step-component.js';

import * as SlackNotifier from '../lib/slack-notifier';

import EmailClient from '../lib/email-client.js';
import ThemesPage from '../lib/pages/themes-page';
import ThemeDetailPage from '../lib/pages/theme-detail-page';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const signupInboxId = config.get( 'signupInboxId' );
const host = dataHelper.getJetpackHost();
const locale = driverManager.currentLocale();
const passwordForTestAccounts = config.get( 'passwordForNewTestSignUps' );
const sandboxCookieValue = config.get( 'storeSandboxCookieValue' );

let driver;

let eyes = eyesHelper.eyesSetup( true );

test.before( async function() {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

test.describe( `[${ host }] Sign Up  (${ screenSize }, ${ locale })`, function() {
	this.timeout( mochaTimeOut );

	test.describe(
		'Sign up for a free site and log in via a magic link @parallel @email',
		function() {
			this.bailSuite( true );
			const blogName = dataHelper.getNewBlogName();
			let newBlogAddress = '';
			const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
			const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );
			let magicLoginLink;

			test.it( 'Ensure we are not logged in as anyone', async function() {
				return await driverManager.ensureNotLoggedIn( driver );
			} );

			test.it( 'Can visit the start page', async function() {
				return await new StartPage( driver, {
					visit: true,
					culture: locale,
				} ).displayed();
			} );

			test.it( 'Can see the "About" page, and enter some site information', async function() {
				const aboutPage = new AboutPage( driver );
				aboutPage.enterSiteDetails( blogName, 'Electronics', {
					share: true,
				} );
				return await aboutPage.submitForm();
			} );

			test.it(
				'Can then see the domains page, and Can search for a blog name, can see and select a free .wordpress address in the results',
				async function() {
					const findADomainComponent = new FindADomainComponent( driver );
					await findADomainComponent.searchForBlogNameAndWaitForResults( blogName );
					await findADomainComponent.checkAndRetryForFreeBlogAddresses(
						expectedBlogAddresses,
						blogName
					);
					let actualAddress = await findADomainComponent.freeBlogAddress();
					assert(
						expectedBlogAddresses.indexOf( actualAddress ) > -1,
						`The displayed free blog address: '${ actualAddress }' was not the expected addresses: '${ expectedBlogAddresses }'`
					);
					newBlogAddress = actualAddress;
					return await findADomainComponent.selectFreeAddress();
				}
			);

			test.it( 'Can see the plans page and pick the free plan', async function() {
				return await new PickAPlanPage( driver ).selectFreePlan();
			} );

			test.it( 'Can see the account page and enter account details', async function() {
				return await new CreateYourAccountPage( driver ).enterAccountDetailsAndSubmit(
					emailAddress,
					blogName,
					passwordForTestAccounts
				);
			} );

			test.it(
				"Can see the sign up processing page -  will finish and show a 'Continue' button which is clicked",
				async function() {
					const signupProcessingPage = new SignupProcessingPage( driver );
					await signupProcessingPage.waitForContinueButtonToBeEnabled();
					return signupProcessingPage.continueAlong();
				}
			);

			test.it( 'Can see expected Welcome message, URL, title, ', async function() {
				const viewBlogPage = new ViewBlogPage( driver );
				await viewBlogPage.waitForTrampolineWelcomeMessage();
				let displayed = await viewBlogPage.isTrampolineWelcomeDisplayed();
				assert.equal( displayed, true, 'The trampoline welcome message is not displayed' );
				let url = await viewBlogPage.urlDisplayed();
				assert.equal(
					url,
					'https://' + newBlogAddress + '/',
					'The displayed URL on the view blog page is not as expected'
				);
				let title = await viewBlogPage.title();
				return assert.equal(
					title,
					blogName,
					'The expected blog title is not displaying correctly'
				);
			} );

			test.it( 'Can log out and request a magic link', async function() {
				await driverManager.clearCookiesAndDeleteLocalStorage( driver );
				return await new LoginPage( driver, true ).requestMagicLink( emailAddress );
			} );

			test.it( 'Can see email containing magic link', async function() {
				const emailClient = new EmailClient( signupInboxId );
				let email = await emailClient.waitForEmailByRecipient( emailAddress );
				if ( email.subject.includes( 'WordPress.com' ) ) {
					return ( magicLoginLink = email.html.links[ 0 ].href );
				}
				return assert(
					magicLoginLink !== undefined,
					'Could not locate the magic login link email link'
				);
			} );

			test.it( 'Can visit the magic link and we should be logged in', async function() {
				await driver.get( magicLoginLink );
				await new MagicLoginPage( driver ).finishLogin();
				return await new ReaderPage( driver ).displayed();
			} );
		}
	);

	test.describe(
		'Sign up for a site on a premium paid plan through main flow in USD currency @parallel @visdiff',
		function() {
			this.bailSuite( true );

			const blogName = dataHelper.getNewBlogName();
			const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
			const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );
			const currencyValue = 'USD';
			const expectedCurrencySymbol = '$';

			test.before( function() {
				let testEnvironment = 'WordPress.com';
				let testName = `Signup [${ global.browserName }] [${ screenSize }]`;
				eyesHelper.eyesOpen( driver, eyes, testEnvironment, testName );
			} );

			test.it( 'Ensure we are not logged in as anyone', async function() {
				return await driverManager.ensureNotLoggedIn( driver );
			} );

			test.it( 'We can set the sandbox cookie for payments', async function() {
				const wPHomePage = new WPHomePage( driver, {
					visit: true,
					culture: locale,
				} );
				await eyesHelper.eyesScreenshot( driver, eyes, 'Logged Out Homepage' );
				await wPHomePage.setSandboxModeForPayments( sandboxCookieValue );
				return await wPHomePage.setCurrencyForPayments( currencyValue );
			} );

			test.it( 'Can visit the start page', async function() {
				return await new StartPage( driver, {
					visit: true,
					culture: locale,
				} ).displayed();
			} );

			test.it( 'Can see the "About" page, and enter some site information', async function() {
				const aboutPage = new AboutPage( driver );
				let displayed = await aboutPage.displayed();
				await eyesHelper.eyesScreenshot( driver, eyes, 'About Page' );
				return assert.equal( displayed, true, 'The about page is not displayed' );
			} );

			test.it( 'Can accept defaults for about page', async function() {
				const aboutPage = new AboutPage( driver );
				await aboutPage.submitForm();
			} );

			test.it( 'Can then see the domains page ', async function() {
				const findADomainComponent = new FindADomainComponent( driver );
				const signupStepComponent = new SignupStepComponent( driver );
				await signupStepComponent.waitForSignupStepLoad();
				let displayed = await findADomainComponent.displayed();
				await eyesHelper.eyesScreenshot( driver, eyes, 'Domains Page' );
				return assert.equal( displayed, true, 'The choose a domain page is not displayed' );
			} );

			test.it(
				'Can search for a blog name, can see and select a free WordPress.com blog address in results',
				async function() {
					const findADomainComponent = new FindADomainComponent( driver );
					await findADomainComponent.searchForBlogNameAndWaitForResults( blogName );
					await findADomainComponent.checkAndRetryForFreeBlogAddresses(
						expectedBlogAddresses,
						blogName
					);
					let actualAddress = await findADomainComponent.freeBlogAddress();
					assert(
						expectedBlogAddresses.indexOf( actualAddress ) > -1,
						`The displayed free blog address: '${ actualAddress }' was not the expected addresses: '${ expectedBlogAddresses }'`
					);

					await eyesHelper.eyesScreenshot( driver, eyes, 'Domains Page Site Address Search' );
					return await findADomainComponent.selectFreeAddress();
				}
			);

			test.it( 'Can then see the plans page and select the premium plan ', async function() {
				const pickAPlanPage = new PickAPlanPage( driver );
				let displayed = await pickAPlanPage.displayed();
				await eyesHelper.eyesScreenshot( driver, eyes, 'Plans Page' );
				assert.equal( displayed, true, 'The pick a plan page is not displayed' );
				return await pickAPlanPage.selectPremiumPlan();
			} );

			test.it( 'Can then enter account details', async function() {
				const createYourAccountPage = new CreateYourAccountPage( driver );
				const signupStepComponent = new SignupStepComponent( driver );
				await signupStepComponent.waitForSignupStepLoad();
				await eyesHelper.eyesScreenshot( driver, eyes, 'Create Account Page' );
				return await createYourAccountPage.enterAccountDetailsAndSubmit(
					emailAddress,
					blogName,
					passwordForTestAccounts
				);
			} );

			if ( global.browserName !== 'Internet Explorer' ) {
				test.it(
					'Can then see the sign up processing page which will automatically move along',
					async function() {
						return await new SignupProcessingPage( driver ).waitToDisappear();
					}
				);
			}

			test.it(
				'Can then see the secure payment page with the premium plan in the cart',
				async function() {
					const securePaymentComponent = new SecurePaymentComponent( driver );
					await eyesHelper.eyesScreenshot( driver, eyes, 'Secure Payment Page' );
					const premiumPlanInCart = await securePaymentComponent.containsPremiumPlan();
					assert.equal( premiumPlanInCart, true, "The cart doesn't contain the premium plan" );
					const numberOfProductsInCart = await securePaymentComponent.numberOfProductsInCart();
					return assert.equal(
						numberOfProductsInCart,
						1,
						"The cart doesn't contain the expected number of products"
					);
				}
			);

			test.it(
				'Can then see the secure payment page with the expected currency in the cart',
				async function() {
					const securePaymentComponent = new SecurePaymentComponent( driver );
					if ( driverManager.currentScreenSize() === 'desktop' ) {
						const totalShown = await securePaymentComponent.cartTotalDisplayed();
						assert.equal(
							totalShown.indexOf( expectedCurrencySymbol ),
							0,
							`The cart total '${ totalShown }' does not begin with '${ expectedCurrencySymbol }'`
						);
					}
					const paymentButtonText = await securePaymentComponent.paymentButtonText();
					return assert(
						paymentButtonText.includes( expectedCurrencySymbol ),
						`The payment button text '${ paymentButtonText }' does not contain the expected currency symbol: '${ expectedCurrencySymbol }'`
					);
				}
			);

			test.it( 'Can enter and submit test payment details', async function() {
				const testCreditCardDetails = dataHelper.getTestCreditCardDetails();
				const securePaymentComponent = new SecurePaymentComponent( driver );
				await securePaymentComponent.enterTestCreditCardDetails( testCreditCardDetails );
				await securePaymentComponent.submitPaymentDetails();
				return await securePaymentComponent.waitForPageToDisappear();
			} );

			test.it( 'Can see the secure check out thank you page', async function() {
				const checkOutThankyouPage = new CheckOutThankyouPage( driver );
				let displayed = await checkOutThankyouPage.displayed();
				await eyesHelper.eyesScreenshot( driver, eyes, 'Checkout Thank You Page' );
				return assert.equal( displayed, true, 'The checkout thank you page is not displayed' );
			} );

			test.after( async function() {
				await eyesHelper.eyesClose( eyes );
			} );
		}
	);

	test.describe(
		'Sign up for a site on a premium paid plan coming in via /create as premium flow in JPY currency @parallel',
		function() {
			this.bailSuite( true );
			const blogName = dataHelper.getNewBlogName();
			const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
			const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );

			const currencyValue = 'JPY';
			const expectedCurrencySymbol = '¥';

			test.before( async function() {
				return await driverManager.ensureNotLoggedIn( driver );
			} );

			test.it( 'We can set the sandbox cookie for payments', async function() {
				const wpHomePage = await new WPHomePage( driver, {
					visit: true,
					culture: locale,
				} );
				await wpHomePage.setSandboxModeForPayments( sandboxCookieValue );
				return await wpHomePage.setCurrencyForPayments( currencyValue );
			} );

			test.it( 'Can visit the start page', async function() {
				return await new StartPage( driver, {
					visit: true,
					culture: locale,
					flow: 'premium',
				} ).displayed();
			} );

			test.it( 'Can see the about page and accept defaults', async function() {
				return await new AboutPage( driver ).submitForm();
			} );

			test.it(
				'Can see the choose a theme page as the starting page, and select the first theme',
				async function() {
					return await new ChooseAThemePage( driver ).selectFirstTheme();
				}
			);

			test.it(
				'Can then see the domains page and can search for a blog name, can see and select a free WordPress.com blog address in results',
				async function() {
					const findADomainComponent = new FindADomainComponent( driver );
					await findADomainComponent.searchForBlogNameAndWaitForResults( blogName );
					await findADomainComponent.checkAndRetryForFreeBlogAddresses(
						expectedBlogAddresses,
						blogName
					);
					let actualAddress = await findADomainComponent.freeBlogAddress();
					assert(
						expectedBlogAddresses.indexOf( actualAddress ) > -1,
						`The displayed free blog address: '${ actualAddress }' was not the expected addresses: '${ expectedBlogAddresses }'`
					);
					return await findADomainComponent.selectFreeAddress();
				}
			);

			test.it( 'Can see the account details page and enter account details', async function() {
				return await new CreateYourAccountPage( driver ).enterAccountDetailsAndSubmit(
					emailAddress,
					blogName,
					passwordForTestAccounts
				);
			} );

			test.it(
				"Can then see the sign up processing page and it will finish and show a 'Continue' button, which is clicked",
				async function() {
					const signupProcessingPage = new SignupProcessingPage( driver );
					await signupProcessingPage.waitForContinueButtonToBeEnabled();
					return await signupProcessingPage.continueAlong();
				}
			);

			test.it(
				'Can then see the secure payment page with the expected currency in the cart',
				async function() {
					const securePaymentComponent = new SecurePaymentComponent( driver );
					if ( driverManager.currentScreenSize() === 'desktop' ) {
						const totalShown = await securePaymentComponent.cartTotalDisplayed();
						assert.equal(
							totalShown.indexOf( expectedCurrencySymbol ),
							0,
							`The cart total '${ totalShown }' does not begin with '${ expectedCurrencySymbol }'`
						);
					}
					const paymentButtonText = await securePaymentComponent.paymentButtonText();
					return assert(
						paymentButtonText.includes( expectedCurrencySymbol ),
						`The payment button text '${ paymentButtonText }' does not contain the expected currency symbol: '${ expectedCurrencySymbol }'`
					);
				}
			);

			test.it(
				'Can then see the secure payment page with the expected products in the cart',
				async function() {
					const securePaymentComponent = new SecurePaymentComponent( driver );
					const premiumPlanInCart = await securePaymentComponent.containsPremiumPlan();
					assert.equal( premiumPlanInCart, true, "The cart doesn't contain the premium plan" );
					const numberOfProductsInCart = await securePaymentComponent.numberOfProductsInCart();
					return assert.equal(
						numberOfProductsInCart,
						1,
						"The cart doesn't contain the expected number of products"
					);
				}
			);

			test.it( 'Can submit test payment details', async function() {
				const testCreditCardDetails = dataHelper.getTestCreditCardDetails();
				const securePaymentComponent = new SecurePaymentComponent( driver );
				await securePaymentComponent.enterTestCreditCardDetails( testCreditCardDetails );
				await securePaymentComponent.submitPaymentDetails();
				return await securePaymentComponent.waitForPageToDisappear();
			} );

			test.it( 'Can see the secure check out thank you page', async function() {
				return await new CheckOutThankyouPage( driver ).displayed();
			} );
		}
	);

	test.describe(
		'Sign up for a site on a personal paid plan coming in via /create as personal flow in GBP currency @parallel',
		function() {
			this.bailSuite( true );
			const blogName = dataHelper.getNewBlogName();
			const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
			const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );
			const currencyValue = 'GBP';
			const expectedCurrencySymbol = '£';

			test.before( async function() {
				return await driverManager.ensureNotLoggedIn( driver );
			} );

			test.it( 'We can set the sandbox cookie for payments', async function() {
				const wpHomePage = await new WPHomePage( driver, {
					visit: true,
					culture: locale,
				} );
				await wpHomePage.setSandboxModeForPayments( sandboxCookieValue );
				return await wpHomePage.setCurrencyForPayments( currencyValue );
			} );

			test.it( 'Can visit the start page', async function() {
				return await new StartPage( driver, {
					visit: true,
					culture: locale,
					flow: 'personal',
				} ).displayed();
			} );

			test.it( 'Can see the about page and accept defaults', async function() {
				return await new AboutPage( driver ).submitForm();
			} );

			test.it(
				'Can see the choose a theme page as the starting page, and select the first theme',
				async function() {
					return await new ChooseAThemePage( driver ).selectFirstTheme();
				}
			);

			test.it(
				'Can then see the domains page and can search for a blog name, can see and select a free WordPress.com blog address in results',
				async function() {
					const findADomainComponent = new FindADomainComponent( driver );
					await findADomainComponent.searchForBlogNameAndWaitForResults( blogName );
					await findADomainComponent.checkAndRetryForFreeBlogAddresses(
						expectedBlogAddresses,
						blogName
					);
					let actualAddress = await findADomainComponent.freeBlogAddress();
					assert(
						expectedBlogAddresses.indexOf( actualAddress ) > -1,
						`The displayed free blog address: '${ actualAddress }' was not the expected addresses: '${ expectedBlogAddresses }'`
					);
					return await findADomainComponent.selectFreeAddress();
				}
			);

			test.it( 'Can see the account details page and enter account details', async function() {
				return await new CreateYourAccountPage( driver ).enterAccountDetailsAndSubmit(
					emailAddress,
					blogName,
					passwordForTestAccounts
				);
			} );

			test.it(
				"Can then see the sign up processing page and it will finish and show a 'Continue' button, which is clicked",
				async function() {
					const signupProcessingPage = new SignupProcessingPage( driver );
					await signupProcessingPage.waitForContinueButtonToBeEnabled();
					return await signupProcessingPage.continueAlong();
				}
			);

			test.it(
				'Can then see the secure payment page with the expected currency in the cart',
				async function() {
					const securePaymentComponent = new SecurePaymentComponent( driver );
					if ( driverManager.currentScreenSize() === 'desktop' ) {
						const totalShown = await securePaymentComponent.cartTotalDisplayed();
						assert.equal(
							totalShown.indexOf( expectedCurrencySymbol ),
							0,
							`The cart total '${ totalShown }' does not begin with '${ expectedCurrencySymbol }'`
						);
					}
					const paymentButtonText = await securePaymentComponent.paymentButtonText();
					return assert(
						paymentButtonText.includes( expectedCurrencySymbol ),
						`The payment button text '${ paymentButtonText }' does not contain the expected currency symbol: '${ expectedCurrencySymbol }'`
					);
				}
			);

			test.it(
				'Can then see the secure payment page with the expected products in the cart',
				async function() {
					const securePaymentComponent = new SecurePaymentComponent( driver );
					const personalPlanInCart = await securePaymentComponent.containsPersonalPlan();
					assert.equal( personalPlanInCart, true, "The cart doesn't contain the personal plan" );
					const numberOfProductsInCart = await securePaymentComponent.numberOfProductsInCart();
					return assert.equal(
						numberOfProductsInCart,
						1,
						"The cart doesn't contain the expected number of products"
					);
				}
			);

			test.it( 'Can submit test payment details', async function() {
				const testCreditCardDetails = dataHelper.getTestCreditCardDetails();
				const securePaymentComponent = new SecurePaymentComponent( driver );
				await securePaymentComponent.enterTestCreditCardDetails( testCreditCardDetails );
				await securePaymentComponent.submitPaymentDetails();
				return await securePaymentComponent.waitForPageToDisappear();
			} );

			test.it( 'Can see the secure check out thank you page', async function() {
				return await new CheckOutThankyouPage( driver ).displayed();
			} );
		}
	);

	test.describe(
		'Sign up for a domain only purchase coming in from wordpress.com/domains in EUR currency @parallel',
		function() {
			this.bailSuite( true );
			const siteName = dataHelper.getNewBlogName();
			const expectedDomainName = `${ siteName }.live`;
			const emailAddress = dataHelper.getEmailAddress( siteName, signupInboxId );
			const testDomainRegistarDetails = dataHelper.getTestDomainRegistarDetails( emailAddress );
			const currencyValue = 'EUR';
			const expectedCurrencySymbol = '€';

			test.it( 'Ensure we are not logged in as anyone', async function() {
				return await driverManager.ensureNotLoggedIn( driver );
			} );

			test.it( 'We can visit set the sandbox cookie for payments', async function() {
				const wpHomePage = await new WPHomePage( driver, {
					visit: true,
					culture: locale,
				} );
				await wpHomePage.setSandboxModeForPayments( sandboxCookieValue );
				return await wpHomePage.setCurrencyForPayments( currencyValue );
			} );

			test.it( 'Can visit the domains start page', async function() {
				return await new StartPage( driver, {
					visit: true,
					culture: locale,
					flow: 'domain-first',
					domainFirst: true,
					domainFirstDomain: expectedDomainName,
				} ).displayed();
			} );

			test.it( 'Can select domain only from the domain first choice page', async function() {
				return await new DomainFirstPage( driver ).chooseJustBuyTheDomain();
			} );

			test.it( 'Can then enter account details', async function() {
				return await new CreateYourAccountPage( driver ).enterAccountDetailsAndSubmit(
					emailAddress,
					siteName,
					passwordForTestAccounts
				);
			} );

			if ( global.browserName !== 'Internet Explorer' ) {
				test.it(
					'Can then see the sign up processing page which will finish automatically move along',
					async function() {
						return await new SignupProcessingPage( driver ).waitToDisappear();
					}
				);
			}

			test.it(
				'Can see checkout page, choose domain privacy option and enter registrar details',
				async function() {
					const checkOutPage = new CheckOutPage( driver );
					await checkOutPage.selectAddPrivacyProtectionCheckbox();
					await checkOutPage.enterRegistarDetails( testDomainRegistarDetails );
					return await checkOutPage.submitForm();
				}
			);

			test.it(
				'Can then see the secure payment page with the correct products in the cart',
				async function() {
					const securePaymentComponent = new SecurePaymentComponent( driver );
					const domainInCart = await securePaymentComponent.containsDotLiveDomain();
					assert.equal( domainInCart, true, "The cart doesn't contain the .live domain product" );
					const privateWhoISInCart = await securePaymentComponent.containsPrivateWhois();
					assert.equal(
						privateWhoISInCart,
						true,
						"The cart doesn't contain the private domain product"
					);
					const numberOfProductsInCart = await securePaymentComponent.numberOfProductsInCart();
					return assert.equal(
						numberOfProductsInCart,
						2,
						"The cart doesn't contain the expected number of products"
					);
				}
			);

			test.it(
				'Can then see the secure payment page with the expected currency in the cart',
				async function() {
					const securePaymentComponent = new SecurePaymentComponent( driver );
					if ( driverManager.currentScreenSize() === 'desktop' ) {
						const totalShown = await securePaymentComponent.cartTotalDisplayed();
						assert.equal(
							totalShown.indexOf( expectedCurrencySymbol ),
							0,
							`The cart total '${ totalShown }' does not begin with '${ expectedCurrencySymbol }'`
						);
					}
					const paymentButtonText = await securePaymentComponent.paymentButtonText();
					return assert(
						paymentButtonText.includes( expectedCurrencySymbol ),
						`The payment button text '${ paymentButtonText }' does not contain the expected currency symbol: '${ expectedCurrencySymbol }'`
					);
				}
			);

			test.it( 'Can enter/submit test payment details', async function() {
				const testCreditCardDetails = dataHelper.getTestCreditCardDetails();
				const securePaymentComponent = new SecurePaymentComponent( driver );
				await securePaymentComponent.enterTestCreditCardDetails( testCreditCardDetails );
				await securePaymentComponent.submitPaymentDetails();
				await securePaymentComponent.waitForCreditCardPaymentProcessing();
				return await securePaymentComponent.waitForPageToDisappear();
			} );

			test.it(
				'Can see the secure check out thank you page and click "go to my domain" button to see the domain only settings page',
				async function() {
					await new CheckOutThankyouPage( driver ).goToMyDomain();
					await new DomainOnlySettingsPage( driver ).manageDomain();
					return await new DomainDetailsPage( driver ).displayed();
				}
			);

			test.it( 'Can open the sidebar', async function() {
				return await new NavBarComponent( driver ).clickMySites();
			} );

			test.it( 'We should only one option - the settings option', async function() {
				const sideBarComponent = new SideBarComponent( driver );
				let numberMenuItems = await sideBarComponent.numberOfMenuItems();
				assert.equal(
					numberMenuItems,
					1,
					'There is not a single menu item for a domain only site'
				);
				let exists = await sideBarComponent.settingsOptionExists();
				return assert( exists, 'The settings menu option does not exist' );
			} );

			// 'Cancel the domain'
			test.after( async function() {
				try {
					await new ReaderPage( driver, true ).displayed();
					await new NavBarComponent( driver ).clickMySites();
					await new SideBarComponent( driver ).selectSettings();
					await new DomainOnlySettingsPage( driver ).manageDomain();
					await new DomainDetailsPage( driver ).viewPaymentSettings();

					const managePurchasePage = new ManagePurchasePage( driver );
					let domainDisplayed = await managePurchasePage.domainDisplayed();
					assert.equal(
						domainDisplayed,
						expectedDomainName,
						'The domain displayed on the manage purchase page is unexpected'
					);
					await managePurchasePage.chooseCancelAndRefund();

					await new CancelPurchasePage( driver ).clickCancelPurchase();

					const cancelDomainPage = new CancelDomainPage( driver );
					return await cancelDomainPage.completeSurveyAndConfirm();
				} catch ( err ) {
					SlackNotifier.warn(
						`There was an error in the hooks that clean up the test domains but since it is cleaning up we really don't care: '${ err }'`
					);
				}
			} );
		}
	);

	test.describe(
		'Sign up for a site on a business paid plan w/ domain name coming in via /create as business flow in CAD currency @parallel',
		function() {
			this.bailSuite( true );

			const siteName = dataHelper.getNewBlogName();
			const expectedDomainName = `${ siteName }.live`;
			const emailAddress = dataHelper.getEmailAddress( siteName, signupInboxId );
			const testDomainRegistarDetails = dataHelper.getTestDomainRegistarDetails( emailAddress );
			const currencyValue = 'CAD';
			const expectedCurrencySymbol = 'C$';

			test.it( 'Ensure we are not logged in as anyone', async function() {
				return await driverManager.ensureNotLoggedIn( driver );
			} );

			test.it( 'We can set the sandbox cookie for payments', async function() {
				const wpHomePage = await new WPHomePage( driver, {
					visit: true,
					culture: locale,
				} );
				await wpHomePage.setSandboxModeForPayments( sandboxCookieValue );
				return await wpHomePage.setCurrencyForPayments( currencyValue );
			} );

			test.it( 'Can visit the start page', async function() {
				return await new StartPage( driver, {
					visit: true,
					culture: locale,
					flow: 'business',
				} ).displayed();
			} );

			test.it( 'Can see the about page and accept defaults', async function() {
				return await new AboutPage( driver ).submitForm();
			} );

			test.it(
				'Can see the choose a theme page as the starting page, and select the first theme',
				async function() {
					return await new ChooseAThemePage( driver ).selectFirstTheme();
				}
			);

			test.it(
				'Can then see the domains page, and can search for a blog name, can see and select a paid .live address in results ',
				async function() {
					const findADomainComponent = new FindADomainComponent( driver );
					await findADomainComponent.searchForBlogNameAndWaitForResults( expectedDomainName );
					return await findADomainComponent.selectDomainAddress( expectedDomainName );
				}
			);

			test.it( 'Can then enter account details and continue', async function() {
				return await new CreateYourAccountPage( driver ).enterAccountDetailsAndSubmit(
					emailAddress,
					siteName,
					passwordForTestAccounts
				);
			} );

			if ( global.browserName !== 'Internet Explorer' ) {
				test.it(
					'Can then see the sign up processing page which will finish automatically move along',
					async function() {
						return await new SignupProcessingPage( driver ).waitToDisappear();
					}
				);
			}

			test.it(
				'Can see checkout page, choose domain privacy option and enter registrar details',
				async function() {
					const checkOutPage = new CheckOutPage( driver );
					await checkOutPage.selectAddPrivacyProtectionCheckbox();
					await checkOutPage.enterRegistarDetails( testDomainRegistarDetails );
					return await checkOutPage.submitForm();
				}
			);

			test.it(
				'Can then see the secure payment page with the correct products in the cart',
				async function() {
					const securePaymentComponent = new SecurePaymentComponent( driver );
					const domainInCart = await securePaymentComponent.containsDotLiveDomain();
					assert.equal( domainInCart, true, "The cart doesn't contain the .live domain product" );
					const privateWhoISInCart = await securePaymentComponent.containsPrivateWhois();
					assert.equal(
						privateWhoISInCart,
						true,
						"The cart doesn't contain the private domain product"
					);
					const businessPlanInCart = await securePaymentComponent.containsBusinessPlan();
					assert.equal(
						businessPlanInCart,
						true,
						"The cart doesn't contain the business plan product"
					);
					const numberOfProductsInCart = await securePaymentComponent.numberOfProductsInCart();
					return assert.equal(
						numberOfProductsInCart,
						3,
						"The cart doesn't contain the expected number of products"
					);
				}
			);

			test.it(
				'Can then see the secure payment page with the expected currency in the cart',
				async function() {
					const securePaymentComponent = new SecurePaymentComponent( driver );
					if ( driverManager.currentScreenSize() === 'desktop' ) {
						const totalShown = await securePaymentComponent.cartTotalDisplayed();
						assert.equal(
							totalShown.indexOf( expectedCurrencySymbol ),
							0,
							`The cart total '${ totalShown }' does not begin with '${ expectedCurrencySymbol }'`
						);
					}
					const paymentButtonText = await securePaymentComponent.paymentButtonText();
					return assert(
						paymentButtonText.includes( expectedCurrencySymbol ),
						`The payment button text '${ paymentButtonText }' does not contain the expected currency symbol: '${ expectedCurrencySymbol }'`
					);
				}
			);

			test.it( 'Can enter/submit test payment details', async function() {
				const testCreditCardDetails = dataHelper.getTestCreditCardDetails();
				const securePaymentComponent = new SecurePaymentComponent( driver );
				await securePaymentComponent.enterTestCreditCardDetails( testCreditCardDetails );
				await securePaymentComponent.submitPaymentDetails();
				await securePaymentComponent.waitForCreditCardPaymentProcessing();
				return await securePaymentComponent.waitForPageToDisappear();
			} );

			test.it( 'Can see the gsuite upsell page', async function() {
				return await new GSuiteUpsellPage( driver ).declineEmail();
			} );

			test.it( 'Can see the secure check out thank you page', async function() {
				return await new CheckOutThankyouPage( driver ).displayed();
			} );

			// 'Cancel the domain'
			test.after( async function() {
				try {
					await new NavBarComponent( driver ).clickProfileLink();
					await new ProfilePage( driver ).chooseManagePurchases();

					let purchasesPage = new PurchasesPage( driver );
					await purchasesPage.dismissGuidedTour();
					await purchasesPage.selectBusinessPlan();

					await new ManagePurchasePage( driver ).chooseCancelAndRefund();

					const cancelPurchasePage = new CancelPurchasePage( driver );
					await cancelPurchasePage.chooseCancelPlanAndDomain();
					await cancelPurchasePage.clickCancelPurchase();
					return await cancelPurchasePage.completeCancellationSurvey();
				} catch ( err ) {
					SlackNotifier.warn(
						`There was an error in the hooks that clean up the test domains but since it is cleaning up we really don't care: '${ err }'`
					);
				}
			} );
		}
	);

	test.describe( 'Basic sign up for a free site @parallel @email @canary @ie11canary', function() {
		this.bailSuite( true );
		let stepNum = 1;

		const blogName = dataHelper.getNewBlogName();
		let newBlogAddress = '';
		const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
		const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );

		test.it( 'Ensure we are not logged in as anyone', async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		test.describe( `Step ${ stepNum }: About Page`, function() {
			stepNum++;

			test.it( 'Can visit the start page', async function() {
				return await new StartPage( driver, {
					visit: true,
					culture: locale,
				} ).displayed();
			} );

			test.it( 'Can see the about page and accept defaults', async function() {
				return await new AboutPage( driver ).submitForm();
			} );

			test.describe( `Step ${ stepNum }: Domains`, function() {
				stepNum++;

				test.it(
					'Can then see the domains page, and Can search for a blog name, can see and select a free .wordpress address in the results',
					async function() {
						const findADomainComponent = new FindADomainComponent( driver );
						await findADomainComponent.searchForBlogNameAndWaitForResults( blogName );
						await findADomainComponent.checkAndRetryForFreeBlogAddresses(
							expectedBlogAddresses,
							blogName
						);
						let actualAddress = await findADomainComponent.freeBlogAddress();
						assert(
							expectedBlogAddresses.indexOf( actualAddress ) > -1,
							`The displayed free blog address: '${ actualAddress }' was not the expected addresses: '${ expectedBlogAddresses }'`
						);
						newBlogAddress = actualAddress;
						return await findADomainComponent.selectFreeAddress();
					}
				);

				test.describe( `Step ${ stepNum }: Plans`, function() {
					stepNum++;

					test.it( 'Can then see the plans page and pick the free plan', async function() {
						return await new PickAPlanPage( driver ).selectFreePlan();
					} );

					test.describe( `Step ${ stepNum }: Account`, function() {
						stepNum++;

						test.it( 'Can then enter account details and continue', async function() {
							return await new CreateYourAccountPage( driver ).enterAccountDetailsAndSubmit(
								emailAddress,
								blogName,
								passwordForTestAccounts
							);
						} );

						test.describe( `Step ${ stepNum }: Sign Up Processing`, function() {
							stepNum++;

							test.it(
								"Can then see the sign up processing page -  will finish and show a 'Continue' button which is clicked",
								async function() {
									const signupProcessingPage = new SignupProcessingPage( driver );
									await signupProcessingPage.waitForContinueButtonToBeEnabled();
									return await signupProcessingPage.continueAlong();
								}
							);

							test.describe( `Step ${ stepNum }: View Site/Trampoline`, function() {
								stepNum++;

								test.it(
									'We are on the view blog page, can see trampoline, our URL and title',
									async function() {
										const viewBlogPage = new ViewBlogPage( driver );
										viewBlogPage.waitForTrampolineWelcomeMessage();
										let displayed = await viewBlogPage.isTrampolineWelcomeDisplayed();
										return assert.equal(
											displayed,
											true,
											'The trampoline welcome message is not displayed'
										);
									}
								);

								test.it( 'Can see the correct blog URL displayed', async function() {
									let url = await new ViewBlogPage( driver ).urlDisplayed();
									return assert.equal(
										url,
										'https://' + newBlogAddress + '/',
										'The displayed URL on the view blog page is not as expected'
									);
								} );

								if ( locale === 'en' ) {
									test.it( 'Can see the correct blog title displayed', async function() {
										let title = await new ViewBlogPage( driver ).title();
										return assert.equal(
											title,
											'Site Title',
											'The expected blog title is not displaying correctly'
										);
									} );
								}
							} );
						} );
					} );
				} );
			} );
		} );
	} );

	test.describe(
		'Sign up while purchasing premium theme in AUD currency @parallel @email',
		function() {
			this.bailSuite( true );

			const blogName = dataHelper.getNewBlogName();
			const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
			const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );
			const currencyValue = 'AUD';
			const expectedCurrencySymbol = 'A$';
			let chosenThemeName = '';

			test.it( 'Ensure we are not logged in as anyone', async function() {
				return await driverManager.ensureNotLoggedIn( driver );
			} );

			test.it( 'We can set the sandbox cookie for payments', async function() {
				const wpHomePage = await new WPHomePage( driver, {
					visit: true,
					culture: locale,
				} );
				await wpHomePage.setSandboxModeForPayments( sandboxCookieValue );
				return await wpHomePage.setCurrencyForPayments( currencyValue );
			} );

			test.it( 'Can see the themes page and select premium theme ', async function() {
				const themesPage = new ThemesPage( driver, true, 'with-theme' );
				await themesPage.showOnlyPremiumThemes();
				chosenThemeName = await themesPage.getFirstThemeName();
				return await themesPage.selectNewTheme();
			} );

			test.it( 'Can pick theme design', async function() {
				return await new ThemeDetailPage( driver ).pickThisDesign();
			} );

			test.it(
				'Can then see the domains page and can search for a blog name, can see and select a free WordPress.com blog address in results',
				async function() {
					const findADomainComponent = new FindADomainComponent( driver );
					await findADomainComponent.searchForBlogNameAndWaitForResults( blogName );
					await findADomainComponent.checkAndRetryForFreeBlogAddresses(
						expectedBlogAddresses,
						blogName
					);
					let actualAddress = await findADomainComponent.freeBlogAddress();
					assert(
						expectedBlogAddresses.indexOf( actualAddress ) > -1,
						`The displayed free blog address: '${ actualAddress }' was not the expected addresses: '${ expectedBlogAddresses }'`
					);
					return await findADomainComponent.selectFreeAddress();
				}
			);

			test.it( 'Can then see the plans page and pick the free plan', async function() {
				return await new PickAPlanPage( driver ).selectFreePlan();
			} );

			test.it( 'Can then enter account details and continue', async function() {
				return await new CreateYourAccountPage( driver ).enterAccountDetailsAndSubmit(
					emailAddress,
					blogName,
					passwordForTestAccounts
				);
			} );

			test.it(
				"Can then see the sign up processing page -  will finish and show a 'Continue' button which is clicked",
				async function() {
					const signupProcessingPage = new SignupProcessingPage( driver );
					await signupProcessingPage.waitForContinueButtonToBeEnabled();
					return await signupProcessingPage.continueAlong();
				}
			);

			test.it(
				'Can then see the secure payment page with the chosen theme in the cart',
				async function() {
					const securePaymentComponent = new SecurePaymentComponent( driver );
					let products = await securePaymentComponent.getProductsNames();
					assert(
						products[ 0 ].search( chosenThemeName ),
						`First product in cart is not ${ chosenThemeName }`
					);
					const numberOfProductsInCart = await securePaymentComponent.numberOfProductsInCart();
					return assert.equal(
						numberOfProductsInCart,
						1,
						"The cart doesn't contain the expected number of products"
					);
				}
			);

			test.it(
				'Can then see the secure payment page with the expected currency in the cart',
				async function() {
					const securePaymentComponent = new SecurePaymentComponent( driver );
					if ( driverManager.currentScreenSize() === 'desktop' ) {
						const totalShown = await securePaymentComponent.cartTotalDisplayed();
						assert.equal(
							totalShown.indexOf( expectedCurrencySymbol ),
							0,
							`The cart total '${ totalShown }' does not begin with '${ expectedCurrencySymbol }'`
						);
					}
					const paymentButtonText = await securePaymentComponent.paymentButtonText();
					return assert(
						paymentButtonText.includes( expectedCurrencySymbol ),
						`The payment button text '${ paymentButtonText }' does not contain the expected currency symbol: '${ expectedCurrencySymbol }'`
					);
				}
			);
		}
	);
} );
