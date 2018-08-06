/** @format */

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
import ThemesPage from '../lib/pages/themes-page';
import ThemeDetailPage from '../lib/pages/theme-detail-page';
import AccountSettingsPage from '../lib/pages/account/account-settings-page';
import CloseAccountPage from '../lib/pages/account/close-account-page';
import DesignTypePage from '../lib/pages/signup/design-type-page';
import ChecklistPage from '../lib/pages/checklist-page';

import FindADomainComponent from '../lib/components/find-a-domain-component.js';
import SecurePaymentComponent from '../lib/components/secure-payment-component.js';
import NavBarComponent from '../lib/components/nav-bar-component';
import SideBarComponent from '../lib/components/sidebar-component';
import LoggedOutMasterbarComponent from '../lib/components/logged-out-masterbar-component';
import NoSitesComponent from '../lib/components/no-sites-component';

import * as SlackNotifier from '../lib/slack-notifier';

import EmailClient from '../lib/email-client.js';

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

before( async function() {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] Sign Up  (${ screenSize }, ${ locale })`, function() {
	this.timeout( mochaTimeOut );

	describe( 'Sign up for a free non-blog site and log in via a magic link @parallel @email', function() {
		const blogName = dataHelper.getNewBlogName();
		let newBlogAddress = '';
		const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
		const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );
		let magicLoginLink;

		before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'Can visit the start page', async function() {
			await StartPage.Visit( driver, StartPage.getStartURL( { culture: locale } ) );
		} );

		step( 'Can see the "About" page, and enter some site information', async function() {
			const aboutPage = await AboutPage.Expect( driver );
			await aboutPage.enterSiteDetails( blogName, 'Electronics', {
				showcase: true,
			} );
			return await aboutPage.submitForm();
		} );

		step(
			'Can then see the domains page, and Can search for a blog name, can see and select a free .wordpress address in the results',
			async function() {
				const findADomainComponent = await FindADomainComponent.Expect( driver );
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

		step( 'Can see the plans page and pick the free plan', async function() {
			const pickAPlanPage = await PickAPlanPage.Expect( driver );
			return await pickAPlanPage.selectFreePlan();
		} );

		step( 'Can see the account page and enter account details', async function() {
			const createYourAccountPage = await CreateYourAccountPage.Expect( driver );
			return await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				blogName,
				passwordForTestAccounts
			);
		} );

		step(
			"Can see the sign up processing page -  will finish and show a 'Continue' button which is clicked",
			async function() {
				const signupProcessingPage = await SignupProcessingPage.Expect( driver );
				await signupProcessingPage.waitForContinueButtonToBeEnabled();
				return signupProcessingPage.continueAlong();
			}
		);

		step( 'Can see expected Welcome message, URL, title, ', async function() {
			const viewBlogPage = await ViewBlogPage.Expect( driver );
			await viewBlogPage.waitForTrampolineWelcomeMessage();
			let displayed = await viewBlogPage.isTrampolineWelcomeDisplayed();
			assert.strictEqual( displayed, true, 'The trampoline welcome message is not displayed' );
			let url = await viewBlogPage.urlDisplayed();
			assert.strictEqual(
				url,
				'https://' + newBlogAddress + '/',
				'The displayed URL on the view blog page is not as expected'
			);
			let title = await viewBlogPage.title();
			return assert.strictEqual(
				title,
				blogName,
				'The expected blog title is not displaying correctly'
			);
		} );

		step( 'Can log out and request a magic link', async function() {
			await driverManager.ensureNotLoggedIn( driver );
			const loginPage = await LoginPage.Visit( driver );
			return await loginPage.requestMagicLink( emailAddress );
		} );

		step( 'Can see email containing magic link', async function() {
			const emailClient = new EmailClient( signupInboxId );
			const validator = emails => emails.find( email => email.subject.includes( 'WordPress.com' ) );
			let emails = await emailClient.pollEmailsByRecipient( emailAddress, validator );
			//Disabled due to a/b test on activation email. See https://github.com/Automattic/wp-e2e-tests/issues/819
			//assert.strictEqual( emails.length, 2, 'The number of newly registered emails is not equal to 2 (activation and magic link)' );
			for ( let email of emails ) {
				if ( email.subject.includes( 'WordPress.com' ) ) {
					return ( magicLoginLink = email.html.links[ 0 ].href );
				}
			}
			return assert(
				magicLoginLink !== undefined,
				'Could not locate the magic login link email link'
			);
		} );

		step( 'Can visit the magic link and we should be logged in', async function() {
			await driver.get( magicLoginLink );
			const magicLoginPage = await MagicLoginPage.Expect( driver );
			await magicLoginPage.finishLogin();
			return await ReaderPage.Expect( driver );
		} );

		step( 'Can delete our newly created account', async function() {
			return ( async () => {
				const navBarComponent = await NavBarComponent.Expect( driver );
				await navBarComponent.clickProfileLink();
				const profilePage = await ProfilePage.Expect( driver );
				await profilePage.chooseAccountSettings();
				const accountSettingsPage = await AccountSettingsPage.Expect( driver );
				await accountSettingsPage.chooseCloseYourAccount();
				const closeAccountPage = await CloseAccountPage.Expect( driver );
				await closeAccountPage.chooseCloseAccount();
				await closeAccountPage.enterAccountNameAndClose( blogName );
				await LoggedOutMasterbarComponent.Expect( driver );
			} )().catch( err => {
				SlackNotifier.warn(
					`There was an error in the hooks that clean up the test account but since it is cleaning up we really don't care: '${ err }'`,
					{ suppressDuplicateMessages: true }
				);
			} );
		} );
	} );

	describe( 'Sign up for a free blog and log in via a magic link @parallel @email', function() {
		const blogName = dataHelper.getNewBlogName();
		const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
		const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );
		let magicLoginLink;

		before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'Can visit the start page', async function() {
			await StartPage.Visit( driver, StartPage.getStartURL( { culture: locale } ) );
		} );

		step( 'Can see the "About" page, and enter some site information', async function() {
			const aboutPage = await AboutPage.Expect( driver );
			await aboutPage.enterSiteDetails( blogName, 'Electronics', {
				share: true,
			} );
			return await aboutPage.submitForm();
		} );

		step(
			'Can then see the domains page, and Can search for a blog name, can see and select a free .wordpress address in the results',
			async function() {
				const findADomainComponent = await FindADomainComponent.Expect( driver );
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

		step( 'Can see the plans page and pick the free plan', async function() {
			const pickAPlanPage = await PickAPlanPage.Expect( driver );
			return await pickAPlanPage.selectFreePlan();
		} );

		step( 'Can see the account page and enter account details', async function() {
			const createYourAccountPage = await CreateYourAccountPage.Expect( driver );
			return await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				blogName,
				passwordForTestAccounts
			);
		} );

		step(
			"Can see the sign up processing page -  will finish and show a 'Continue' button which is clicked",
			async function() {
				const signupProcessingPage = await SignupProcessingPage.Expect( driver );
				await signupProcessingPage.waitForContinueButtonToBeEnabled();
				return signupProcessingPage.continueAlong();
			}
		);

		step( 'Can then see the onboarding checklist', async function() {
			const checklistPage = await ChecklistPage.Expect( driver );
			const header = await checklistPage.headerExists();
			const subheader = await checklistPage.subheaderExists();

			assert( header, 'The checklist header does not exist.' );

			return assert( subheader, 'The checklist subheader does not exist.' );
		} );

		step( 'Can log out and request a magic link', async function() {
			await driverManager.ensureNotLoggedIn( driver );
			const loginPage = await LoginPage.Visit( driver );
			return await loginPage.requestMagicLink( emailAddress );
		} );

		step( 'Can see email containing magic link', async function() {
			const emailClient = new EmailClient( signupInboxId );
			const validator = emails => emails.find( email => email.subject.includes( 'WordPress.com' ) );
			let emails = await emailClient.pollEmailsByRecipient( emailAddress, validator );
			//Disabled due to a/b test on activation email. See https://github.com/Automattic/wp-e2e-tests/issues/819
			//assert.strictEqual( emails.length, 2, 'The number of newly registered emails is not equal to 2 (activation and magic link)' );
			for ( let email of emails ) {
				if ( email.subject.includes( 'WordPress.com' ) ) {
					return ( magicLoginLink = email.html.links[ 0 ].href );
				}
			}
			return assert(
				magicLoginLink !== undefined,
				'Could not locate the magic login link email link'
			);
		} );

		step( 'Can visit the magic link and we should be logged in', async function() {
			await driver.get( magicLoginLink );
			const magicLoginPage = await MagicLoginPage.Expect( driver );
			await magicLoginPage.finishLogin();
			return await ReaderPage.Expect( driver );
		} );

		step( 'Can delete our newly created account', async function() {
			return ( async () => {
				const navBarComponent = await NavBarComponent.Expect( driver );
				await navBarComponent.clickProfileLink();
				const profilePage = await ProfilePage.Expect( driver );
				await profilePage.chooseAccountSettings();
				const accountSettingsPage = await AccountSettingsPage.Expect( driver );
				await accountSettingsPage.chooseCloseYourAccount();
				const closeAccountPage = await CloseAccountPage.Expect( driver );
				await closeAccountPage.chooseCloseAccount();
				await closeAccountPage.enterAccountNameAndClose( blogName );
				await LoggedOutMasterbarComponent.Expect( driver );
			} )().catch( err => {
				SlackNotifier.warn(
					`There was an error in the hooks that clean up the test account but since it is cleaning up we really don't care: '${ err }'`,
					{ suppressDuplicateMessages: true }
				);
			} );
		} );
	} );

	describe( 'Sign up for a non-blog site on a premium paid plan through main flow in USD currency @parallel @visdiff', function() {
		const blogName = dataHelper.getNewBlogName();
		const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
		const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );
		const currencyValue = 'USD';
		const expectedCurrencySymbol = '$';

		before( function() {
			let testEnvironment = 'WordPress.com';
			let testName = `Signup [${ global.browserName }] [${ screenSize }]`;
			eyesHelper.eyesOpen( driver, eyes, testEnvironment, testName );
		} );

		before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'We can set the sandbox cookie for payments', async function() {
			const wPHomePage = await WPHomePage.Visit( driver );
			await wPHomePage.checkURL( locale );
			await eyesHelper.eyesScreenshot( driver, eyes, 'Logged Out Homepage' );
			await wPHomePage.setSandboxModeForPayments( sandboxCookieValue );
			return await wPHomePage.setCurrencyForPayments( currencyValue );
		} );

		step( 'Can visit the start page', async function() {
			await StartPage.Visit( driver, StartPage.getStartURL( { culture: locale } ) );
		} );

		step( 'Can see the "About" page, and enter some site information', async function() {
			const aboutPage = await AboutPage.Expect( driver );
			await aboutPage.enterSiteDetails( blogName, '', {
				showcase: true,
			} );
			return await eyesHelper.eyesScreenshot( driver, eyes, 'About Page' );
		} );

		step( 'Can accept defaults for about page', async function() {
			const aboutPage = await AboutPage.Expect( driver );
			await aboutPage.submitForm();
		} );

		step( 'Can then see the domains page ', async function() {
			const findADomainComponent = await FindADomainComponent.Expect( driver );
			let displayed = await findADomainComponent.displayed();
			await eyesHelper.eyesScreenshot( driver, eyes, 'Domains Page' );
			return assert.strictEqual( displayed, true, 'The choose a domain page is not displayed' );
		} );

		step(
			'Can search for a blog name, can see and select a free WordPress.com blog address in results',
			async function() {
				const findADomainComponent = await FindADomainComponent.Expect( driver );
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

		step( 'Can then see the plans page and select the premium plan ', async function() {
			const pickAPlanPage = await PickAPlanPage.Expect( driver );
			let displayed = await pickAPlanPage.displayed();
			await eyesHelper.eyesScreenshot( driver, eyes, 'Plans Page' );
			assert.strictEqual( displayed, true, 'The pick a plan page is not displayed' );
			return await pickAPlanPage.selectPremiumPlan();
		} );

		step( 'Can then enter account details', async function() {
			const createYourAccountPage = await CreateYourAccountPage.Expect( driver );
			await eyesHelper.eyesScreenshot( driver, eyes, 'Create Account Page' );
			return await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				blogName,
				passwordForTestAccounts
			);
		} );

		step(
			'Can then see the sign up processing page which will automatically move along',
			async function() {
				if ( global.browserName === 'Internet Explorer' ) {
					return;
				}
				const signupProcessingPage = await SignupProcessingPage.Expect( driver );
				return await signupProcessingPage.waitToDisappear();
			}
		);

		step(
			'Can then see the secure payment page with the premium plan in the cart',
			async function() {
				const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
				await eyesHelper.eyesScreenshot( driver, eyes, 'Secure Payment Page' );
				const premiumPlanInCart = await securePaymentComponent.containsPremiumPlan();
				assert.strictEqual( premiumPlanInCart, true, "The cart doesn't contain the premium plan" );
				const numberOfProductsInCart = await securePaymentComponent.numberOfProductsInCart();
				return assert.strictEqual(
					numberOfProductsInCart,
					1,
					"The cart doesn't contain the expected number of products"
				);
			}
		);

		step(
			'Can then see the secure payment page with the expected currency in the cart',
			async function() {
				const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
				if ( driverManager.currentScreenSize() === 'desktop' ) {
					const totalShown = await securePaymentComponent.cartTotalDisplayed();
					assert.strictEqual(
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

		step( 'Can enter and submit test payment details', async function() {
			const testCreditCardDetails = dataHelper.getTestCreditCardDetails();
			const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
			await securePaymentComponent.enterTestCreditCardDetails( testCreditCardDetails );
			await securePaymentComponent.submitPaymentDetails();
			return await securePaymentComponent.waitForPageToDisappear();
		} );

		step( 'Can see the secure check out thank you page', async function() {
			const checkOutThankyouPage = await CheckOutThankyouPage.Expect( driver );
			let displayed = await checkOutThankyouPage.displayed();
			await eyesHelper.eyesScreenshot( driver, eyes, 'Checkout Thank You Page' );
			return assert.strictEqual( displayed, true, 'The checkout thank you page is not displayed' );
		} );

		step( 'Can delete the plan', async function() {
			return ( async () => {
				const navBarComponent = await NavBarComponent.Expect( driver );
				await navBarComponent.clickProfileLink();
				const profilePage = await ProfilePage.Expect( driver );
				await profilePage.chooseManagePurchases();
				const purchasesPage = await PurchasesPage.Expect( driver );
				await purchasesPage.dismissGuidedTour();
				await purchasesPage.selectPremiumPlan();
				const managePurchasePage = await ManagePurchasePage.Expect( driver );
				await managePurchasePage.chooseCancelAndRefund();
				const cancelPurchasePage = await CancelPurchasePage.Expect( driver );
				await cancelPurchasePage.clickCancelPurchase();
				await cancelPurchasePage.completeCancellationSurvey();
				return await cancelPurchasePage.waitAndDismissSuccessNotice();
			} )().catch( err => {
				SlackNotifier.warn(
					`There was an error in the hooks that clean up the test account but since it is cleaning up we really don't care: '${ err }'`,
					{ suppressDuplicateMessages: true }
				);
			} );
		} );

		step( 'Can delete our newly created account', async function() {
			return ( async () => {
				const navBarComponent = await NavBarComponent.Expect( driver );
				await navBarComponent.clickProfileLink();
				const profilePage = await ProfilePage.Expect( driver );
				await profilePage.chooseAccountSettings();
				const accountSettingsPage = await AccountSettingsPage.Expect( driver );
				await accountSettingsPage.chooseCloseYourAccount();
				const closeAccountPage = await CloseAccountPage.Expect( driver );
				await closeAccountPage.chooseCloseAccount();
				await closeAccountPage.enterAccountNameAndClose( blogName );
				await LoggedOutMasterbarComponent.Expect( driver );
			} )().catch( err => {
				SlackNotifier.warn(
					`There was an error in the hooks that clean up the test account but since it is cleaning up we really don't care: '${ err }'`,
					{ suppressDuplicateMessages: true }
				);
			} );
		} );

		after( async function() {
			await eyesHelper.eyesClose( eyes );
		} );
	} );

	describe( 'Sign up for a blog on a premium paid plan through main flow in USD currency @parallel @visdiff', function() {
		const blogName = dataHelper.getNewBlogName();
		const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
		const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );
		const currencyValue = 'USD';
		const expectedCurrencySymbol = '$';

		before( function() {
			let testEnvironment = 'WordPress.com';
			let testName = `Signup [${ global.browserName }] [${ screenSize }]`;
			eyesHelper.eyesOpen( driver, eyes, testEnvironment, testName );
		} );

		before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'We can set the sandbox cookie for payments', async function() {
			const wPHomePage = await WPHomePage.Visit( driver );
			await wPHomePage.checkURL( locale );
			await eyesHelper.eyesScreenshot( driver, eyes, 'Logged Out Homepage' );
			await wPHomePage.setSandboxModeForPayments( sandboxCookieValue );
			return await wPHomePage.setCurrencyForPayments( currencyValue );
		} );

		step( 'Can visit the start page', async function() {
			await StartPage.Visit( driver, StartPage.getStartURL( { culture: locale } ) );
		} );

		step( 'Can see the "About" page, and enter some site information', async function() {
			const aboutPage = await AboutPage.Expect( driver );
			await aboutPage.enterSiteDetails( blogName, '', {
				share: true,
			} );
			return await eyesHelper.eyesScreenshot( driver, eyes, 'About Page' );
		} );

		step( 'Can accept defaults for about page', async function() {
			const aboutPage = await AboutPage.Expect( driver );
			await aboutPage.submitForm();
		} );

		step( 'Can then see the domains page ', async function() {
			const findADomainComponent = await FindADomainComponent.Expect( driver );
			let displayed = await findADomainComponent.displayed();
			await eyesHelper.eyesScreenshot( driver, eyes, 'Domains Page' );
			return assert.strictEqual( displayed, true, 'The choose a domain page is not displayed' );
		} );

		step(
			'Can search for a blog name, can see and select a free WordPress.com blog address in results',
			async function() {
				const findADomainComponent = await FindADomainComponent.Expect( driver );
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

		step( 'Can then see the plans page and select the premium plan ', async function() {
			const pickAPlanPage = await PickAPlanPage.Expect( driver );
			let displayed = await pickAPlanPage.displayed();
			await eyesHelper.eyesScreenshot( driver, eyes, 'Plans Page' );
			assert.strictEqual( displayed, true, 'The pick a plan page is not displayed' );
			return await pickAPlanPage.selectPremiumPlan();
		} );

		step( 'Can then enter account details', async function() {
			const createYourAccountPage = await CreateYourAccountPage.Expect( driver );
			await eyesHelper.eyesScreenshot( driver, eyes, 'Create Account Page' );
			return await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				blogName,
				passwordForTestAccounts
			);
		} );

		step(
			'Can then see the sign up processing page which will automatically move along',
			async function() {
				if ( global.browserName === 'Internet Explorer' ) {
					return;
				}
				const signupProcessingPage = await SignupProcessingPage.Expect( driver );
				return await signupProcessingPage.waitToDisappear();
			}
		);

		step(
			'Can then see the secure payment page with the premium plan in the cart',
			async function() {
				const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
				await eyesHelper.eyesScreenshot( driver, eyes, 'Secure Payment Page' );
				const premiumPlanInCart = await securePaymentComponent.containsPremiumPlan();
				assert.strictEqual( premiumPlanInCart, true, "The cart doesn't contain the premium plan" );
				const numberOfProductsInCart = await securePaymentComponent.numberOfProductsInCart();
				return assert.strictEqual(
					numberOfProductsInCart,
					1,
					"The cart doesn't contain the expected number of products"
				);
			}
		);

		step(
			'Can then see the secure payment page with the expected currency in the cart',
			async function() {
				const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
				if ( driverManager.currentScreenSize() === 'desktop' ) {
					const totalShown = await securePaymentComponent.cartTotalDisplayed();
					assert.strictEqual(
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

		step( 'Can enter and submit test payment details', async function() {
			const testCreditCardDetails = dataHelper.getTestCreditCardDetails();
			const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
			await securePaymentComponent.enterTestCreditCardDetails( testCreditCardDetails );
			await securePaymentComponent.submitPaymentDetails();
			return await securePaymentComponent.waitForPageToDisappear();
		} );

		step( 'Can then see the onboarding checklist', async function() {
			const checklistPage = await ChecklistPage.Expect( driver );
			const header = await checklistPage.headerExists();
			const subheader = await checklistPage.subheaderExists();

			assert( header, 'The checklist header does not exist.' );

			return assert( subheader, 'The checklist subheader does not exist.' );
		} );

		step( 'Can delete the plan', async function() {
			return ( async () => {
				const navBarComponent = await NavBarComponent.Expect( driver );
				await navBarComponent.clickProfileLink();
				const profilePage = await ProfilePage.Expect( driver );
				await profilePage.chooseManagePurchases();
				const purchasesPage = await PurchasesPage.Expect( driver );
				await purchasesPage.dismissGuidedTour();
				await purchasesPage.selectPremiumPlan();
				const managePurchasePage = await ManagePurchasePage.Expect( driver );
				await managePurchasePage.chooseCancelAndRefund();
				const cancelPurchasePage = await CancelPurchasePage.Expect( driver );
				await cancelPurchasePage.clickCancelPurchase();
				await cancelPurchasePage.completeCancellationSurvey();
				return await cancelPurchasePage.waitAndDismissSuccessNotice();
			} )().catch( err => {
				SlackNotifier.warn(
					`There was an error in the hooks that clean up the test account but since it is cleaning up we really don't care: '${ err }'`,
					{ suppressDuplicateMessages: true }
				);
			} );
		} );

		step( 'Can delete our newly created account', async function() {
			return ( async () => {
				const navBarComponent = await NavBarComponent.Expect( driver );
				await navBarComponent.clickProfileLink();
				const profilePage = await ProfilePage.Expect( driver );
				await profilePage.chooseAccountSettings();
				const accountSettingsPage = await AccountSettingsPage.Expect( driver );
				await accountSettingsPage.chooseCloseYourAccount();
				const closeAccountPage = await CloseAccountPage.Expect( driver );
				await closeAccountPage.chooseCloseAccount();
				await closeAccountPage.enterAccountNameAndClose( blogName );
				await LoggedOutMasterbarComponent.Expect( driver );
			} )().catch( err => {
				SlackNotifier.warn(
					`There was an error in the hooks that clean up the test account but since it is cleaning up we really don't care: '${ err }'`,
					{ suppressDuplicateMessages: true }
				);
			} );
		} );

		after( async function() {
			await eyesHelper.eyesClose( eyes );
		} );
	} );

	describe( 'Sign up for a site on a premium paid plan coming in via /create as premium flow in JPY currency @parallel', function() {
		const blogName = dataHelper.getNewBlogName();
		const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
		const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );

		const currencyValue = 'JPY';
		const expectedCurrencySymbol = '¥';

		before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'We can set the sandbox cookie for payments', async function() {
			const wPHomePage = await WPHomePage.Visit( driver );
			await wPHomePage.checkURL( locale );
			await wPHomePage.setSandboxModeForPayments( sandboxCookieValue );
			return await wPHomePage.setCurrencyForPayments( currencyValue );
		} );

		step( 'Can visit the start page', async function() {
			await StartPage.Visit(
				driver,
				StartPage.getStartURL( { culture: locale, flow: 'premium' } )
			);
		} );

		step( 'Can see the about page and accept defaults', async function() {
			const aboutPage = await AboutPage.Expect( driver );
			await aboutPage.enterSiteDetails( blogName, '', {
				showcase: true,
			} );
			return await aboutPage.submitForm();
		} );

		step(
			'Can see the choose a theme page as the starting page, and select the first theme',
			async function() {
				const chooseAThemePage = await ChooseAThemePage.Expect( driver );
				return await chooseAThemePage.selectFirstTheme();
			}
		);

		step(
			'Can then see the domains page and can search for a blog name, can see and select a free WordPress.com blog address in results',
			async function() {
				const findADomainComponent = await FindADomainComponent.Expect( driver );
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

		step( 'Can see the account details page and enter account details', async function() {
			const createYourAccountPage = await CreateYourAccountPage.Expect( driver );
			return await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				blogName,
				passwordForTestAccounts
			);
		} );

		step(
			"Can then see the sign up processing page and it will finish and show a 'Continue' button, which is clicked",
			async function() {
				const signupProcessingPage = await SignupProcessingPage.Expect( driver );
				await signupProcessingPage.waitForContinueButtonToBeEnabled();
				return await signupProcessingPage.continueAlong();
			}
		);

		step(
			'Can then see the secure payment page with the expected currency in the cart',
			async function() {
				const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
				if ( driverManager.currentScreenSize() === 'desktop' ) {
					const totalShown = await securePaymentComponent.cartTotalDisplayed();
					assert.strictEqual(
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

		step(
			'Can then see the secure payment page with the expected products in the cart',
			async function() {
				const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
				const premiumPlanInCart = await securePaymentComponent.containsPremiumPlan();
				assert.strictEqual( premiumPlanInCart, true, "The cart doesn't contain the premium plan" );
				const numberOfProductsInCart = await securePaymentComponent.numberOfProductsInCart();
				return assert.strictEqual(
					numberOfProductsInCart,
					1,
					"The cart doesn't contain the expected number of products"
				);
			}
		);

		step( 'Can submit test payment details', async function() {
			const testCreditCardDetails = dataHelper.getTestCreditCardDetails();
			const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
			await securePaymentComponent.enterTestCreditCardDetails( testCreditCardDetails );
			await securePaymentComponent.submitPaymentDetails();
			return await securePaymentComponent.waitForPageToDisappear();
		} );

		step( 'Can see the secure check out thank you page', async function() {
			return await CheckOutThankyouPage.Expect( driver );
		} );

		step( 'Can delete the plan', async function() {
			return ( async () => {
				const navBarComponent = await NavBarComponent.Expect( driver );
				await navBarComponent.clickProfileLink();
				const profilePage = await ProfilePage.Expect( driver );
				await profilePage.chooseManagePurchases();
				const purchasesPage = await PurchasesPage.Expect( driver );
				await purchasesPage.dismissGuidedTour();
				await purchasesPage.selectPremiumPlan();
				const managePurchasePage = await ManagePurchasePage.Expect( driver );
				await managePurchasePage.chooseCancelAndRefund();
				const cancelPurchasePage = await CancelPurchasePage.Expect( driver );
				await cancelPurchasePage.clickCancelPurchase();
				await cancelPurchasePage.completeCancellationSurvey();
				return await cancelPurchasePage.waitAndDismissSuccessNotice();
			} )().catch( err => {
				SlackNotifier.warn(
					`There was an error in the hooks that clean up the test account but since it is cleaning up we really don't care: '${ err }'`,
					{ suppressDuplicateMessages: true }
				);
			} );
		} );

		step( 'Can delete our newly created account', async function() {
			return ( async () => {
				const navBarComponent = await NavBarComponent.Expect( driver );
				await navBarComponent.clickProfileLink();
				const profilePage = await ProfilePage.Expect( driver );
				await profilePage.chooseAccountSettings();
				const accountSettingsPage = await AccountSettingsPage.Expect( driver );
				await accountSettingsPage.chooseCloseYourAccount();
				const closeAccountPage = await CloseAccountPage.Expect( driver );
				await closeAccountPage.chooseCloseAccount();
				await closeAccountPage.enterAccountNameAndClose( blogName );
				await LoggedOutMasterbarComponent.Expect( driver );
			} )().catch( err => {
				SlackNotifier.warn(
					`There was an error in the hooks that clean up the test account but since it is cleaning up we really don't care: '${ err }'`,
					{ suppressDuplicateMessages: true }
				);
			} );
		} );
	} );

	describe( 'Sign up for a site on a personal paid plan coming in via /create as personal flow in GBP currency @parallel', function() {
		const blogName = dataHelper.getNewBlogName();
		const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
		const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );
		const currencyValue = 'GBP';
		const expectedCurrencySymbol = '£';

		before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'We can set the sandbox cookie for payments', async function() {
			const wPHomePage = await WPHomePage.Visit( driver );
			await wPHomePage.checkURL( locale );
			await wPHomePage.setSandboxModeForPayments( sandboxCookieValue );
			return await wPHomePage.setCurrencyForPayments( currencyValue );
		} );

		step( 'Can visit the start page', async function() {
			await StartPage.Visit(
				driver,
				StartPage.getStartURL( { culture: locale, flow: 'personal' } )
			);
		} );

		step( 'Can see the about page and accept defaults', async function() {
			const aboutPage = await AboutPage.Expect( driver );
			await aboutPage.enterSiteDetails( blogName, '', {
				showcase: true,
			} );
			return await aboutPage.submitForm();
		} );

		step(
			'Can see the choose a theme page as the starting page, and select the first theme',
			async function() {
				const chooseAThemePage = await ChooseAThemePage.Expect( driver );
				return await chooseAThemePage.selectFirstTheme();
			}
		);

		step(
			'Can then see the domains page and can search for a blog name, can see and select a free WordPress.com blog address in results',
			async function() {
				const findADomainComponent = await FindADomainComponent.Expect( driver );
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

		step( 'Can see the account details page and enter account details', async function() {
			const createYourAccountPage = await CreateYourAccountPage.Expect( driver );
			return await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				blogName,
				passwordForTestAccounts
			);
		} );

		step(
			"Can then see the sign up processing page and it will finish and show a 'Continue' button, which is clicked",
			async function() {
				const signupProcessingPage = await SignupProcessingPage.Expect( driver );
				await signupProcessingPage.waitForContinueButtonToBeEnabled();
				return await signupProcessingPage.continueAlong();
			}
		);

		step(
			'Can then see the secure payment page with the expected currency in the cart',
			async function() {
				const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
				if ( driverManager.currentScreenSize() === 'desktop' ) {
					const totalShown = await securePaymentComponent.cartTotalDisplayed();
					assert.strictEqual(
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

		step(
			'Can then see the secure payment page with the expected products in the cart',
			async function() {
				const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
				const personalPlanInCart = await securePaymentComponent.containsPersonalPlan();
				assert.strictEqual(
					personalPlanInCart,
					true,
					"The cart doesn't contain the personal plan"
				);
				const numberOfProductsInCart = await securePaymentComponent.numberOfProductsInCart();
				return assert.strictEqual(
					numberOfProductsInCart,
					1,
					"The cart doesn't contain the expected number of products"
				);
			}
		);

		step( 'Can submit test payment details', async function() {
			const testCreditCardDetails = dataHelper.getTestCreditCardDetails();
			const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
			await securePaymentComponent.enterTestCreditCardDetails( testCreditCardDetails );
			await securePaymentComponent.submitPaymentDetails();
			return await securePaymentComponent.waitForPageToDisappear();
		} );

		step( 'Can see the secure check out thank you page', async function() {
			return await CheckOutThankyouPage.Expect( driver );
		} );

		step( 'Can delete the plan', async function() {
			return ( async () => {
				const navBarComponent = await NavBarComponent.Expect( driver );
				await navBarComponent.clickProfileLink();
				const profilePage = await ProfilePage.Expect( driver );
				await profilePage.chooseManagePurchases();
				const purchasesPage = await PurchasesPage.Expect( driver );
				await purchasesPage.dismissGuidedTour();
				await purchasesPage.selectPersonalPlan();
				const managePurchasePage = await ManagePurchasePage.Expect( driver );
				await managePurchasePage.chooseCancelAndRefund();
				const cancelPurchasePage = await CancelPurchasePage.Expect( driver );
				await cancelPurchasePage.clickCancelPurchase();
				await cancelPurchasePage.completeCancellationSurvey();
				return await cancelPurchasePage.waitAndDismissSuccessNotice();
			} )().catch( err => {
				SlackNotifier.warn(
					`There was an error in the hooks that clean up the test account but since it is cleaning up we really don't care: '${ err }'`,
					{ suppressDuplicateMessages: true }
				);
			} );
		} );

		step( 'Can delete our newly created account', async function() {
			return ( async () => {
				const navBarComponent = await NavBarComponent.Expect( driver );
				await navBarComponent.clickProfileLink();
				const profilePage = await ProfilePage.Expect( driver );
				await profilePage.chooseAccountSettings();
				const accountSettingsPage = await AccountSettingsPage.Expect( driver );
				await accountSettingsPage.chooseCloseYourAccount();
				const closeAccountPage = await CloseAccountPage.Expect( driver );
				await closeAccountPage.chooseCloseAccount();
				await closeAccountPage.enterAccountNameAndClose( blogName );
				await LoggedOutMasterbarComponent.Expect( driver );
			} )().catch( err => {
				SlackNotifier.warn(
					`There was an error in the hooks that clean up the test account but since it is cleaning up we really don't care: '${ err }'`,
					{ suppressDuplicateMessages: true }
				);
			} );
		} );
	} );

	describe( 'Sign up for a domain only purchase coming in from wordpress.com/domains in EUR currency @parallel', function() {
		const siteName = dataHelper.getNewBlogName();
		const expectedDomainName = `${ siteName }.live`;
		const emailAddress = dataHelper.getEmailAddress( siteName, signupInboxId );
		const testDomainRegistarDetails = dataHelper.getTestDomainRegistarDetails( emailAddress );
		const currencyValue = 'EUR';
		const expectedCurrencySymbol = '€';

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
			const wPHomePage = await WPHomePage.Visit( driver );
			await wPHomePage.checkURL( locale );
			await wPHomePage.setSandboxModeForPayments( sandboxCookieValue );
			return await wPHomePage.setCurrencyForPayments( currencyValue );
		} );

		step( 'Can visit the domains start page', async function() {
			await StartPage.Visit(
				driver,
				StartPage.getStartURL( {
					culture: locale,
					flow: 'domain-first/site-or-domain',
					query: `new=${ expectedDomainName }`,
				} )
			);
		} );

		step( 'Can select domain only from the domain first choice page', async function() {
			const domainFirstPage = await DomainFirstPage.Expect( driver );
			return await domainFirstPage.chooseJustBuyTheDomain();
		} );

		step( 'Can then enter account details', async function() {
			const createYourAccountPage = await CreateYourAccountPage.Expect( driver );
			return await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				siteName,
				passwordForTestAccounts
			);
		} );

		step(
			'Can then see the sign up processing page which will finish automatically move along',
			async function() {
				if ( global.browserName === 'Internet Explorer' ) {
					return;
				}
				const signupProcessingPage = await SignupProcessingPage.Expect( driver );
				return await signupProcessingPage.waitToDisappear();
			}
		);

		step(
			'Can see checkout page, choose domain privacy option and enter registrar details',
			async function() {
				const checkOutPage = await CheckOutPage.Expect( driver );
				await checkOutPage.selectAddPrivacyProtectionCheckbox();
				await checkOutPage.enterRegistarDetails( testDomainRegistarDetails );
				return await checkOutPage.submitForm();
			}
		);

		step(
			'Can then see the secure payment page with the correct products in the cart',
			async function() {
				const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
				const domainInCart = await securePaymentComponent.containsDotLiveDomain();
				assert.strictEqual(
					domainInCart,
					true,
					"The cart doesn't contain the .live domain product"
				);
				const privateWhoISInCart = await securePaymentComponent.containsPrivateWhois();
				assert.strictEqual(
					privateWhoISInCart,
					true,
					"The cart doesn't contain the private domain product"
				);
				const numberOfProductsInCart = await securePaymentComponent.numberOfProductsInCart();
				return assert.strictEqual(
					numberOfProductsInCart,
					2,
					"The cart doesn't contain the expected number of products"
				);
			}
		);

		step(
			'Can then see the secure payment page with the expected currency in the cart',
			async function() {
				const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
				if ( driverManager.currentScreenSize() === 'desktop' ) {
					const totalShown = await securePaymentComponent.cartTotalDisplayed();
					assert.strictEqual(
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

		step( 'Can enter/submit test payment details', async function() {
			const testCreditCardDetails = dataHelper.getTestCreditCardDetails();
			const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
			await securePaymentComponent.enterTestCreditCardDetails( testCreditCardDetails );
			await securePaymentComponent.submitPaymentDetails();
			await securePaymentComponent.waitForCreditCardPaymentProcessing();
			return await securePaymentComponent.waitForPageToDisappear();
		} );

		step(
			'Can see the secure check out thank you page and click "go to my domain" button to see the domain only settings page',
			async function() {
				const checkOutThankyouPage = await CheckOutThankyouPage.Expect( driver );
				await checkOutThankyouPage.goToMyDomain();
				const domainOnlySettingsPage = await DomainOnlySettingsPage.Expect( driver );
				await domainOnlySettingsPage.manageDomain();
				return await DomainDetailsPage.Expect( driver );
			}
		);

		step( 'Can open the sidebar', async function() {
			const navBarComponent = await NavBarComponent.Expect( driver );
			await navBarComponent.clickMySites();
		} );

		step( 'We should only one option - the settings option', async function() {
			const sideBarComponent = await SideBarComponent.Expect( driver );
			let numberMenuItems = await sideBarComponent.numberOfMenuItems();
			assert.strictEqual(
				numberMenuItems,
				1,
				'There is not a single menu item for a domain only site'
			);
			let exists = await sideBarComponent.settingsOptionExists();
			return assert( exists, 'The settings menu option does not exist' );
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

	describe( 'Sign up for a site on a business paid plan w/ domain name coming in via /create as business flow in CAD currency @parallel', function() {
		const siteName = dataHelper.getNewBlogName();
		const expectedDomainName = `${ siteName }.live`;
		const emailAddress = dataHelper.getEmailAddress( siteName, signupInboxId );
		const testDomainRegistarDetails = dataHelper.getTestDomainRegistarDetails( emailAddress );
		const currencyValue = 'CAD';
		const expectedCurrencySymbol = 'C$';

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

		step( 'We can set the sandbox cookie for payments', async function() {
			const wPHomePage = await WPHomePage.Visit( driver );
			await wPHomePage.checkURL( locale );
			await wPHomePage.setSandboxModeForPayments( sandboxCookieValue );
			return await wPHomePage.setCurrencyForPayments( currencyValue );
		} );

		step( 'Can visit the start page', async function() {
			await StartPage.Visit(
				driver,
				StartPage.getStartURL( { culture: locale, flow: 'business' } )
			);
		} );

		step( 'Can see the about page and accept defaults', async function() {
			const aboutPage = await AboutPage.Expect( driver );
			return await aboutPage.submitForm();
		} );

		step(
			'Can see the choose a theme page as the starting page, and select the first theme',
			async function() {
				const chooseAThemePage = await ChooseAThemePage.Expect( driver );
				return await chooseAThemePage.selectFirstTheme();
			}
		);

		step(
			'Can then see the domains page, and can search for a blog name, can see and select a paid .live address in results ',
			async function() {
				const findADomainComponent = await FindADomainComponent.Expect( driver );
				await findADomainComponent.searchForBlogNameAndWaitForResults( expectedDomainName );
				return await findADomainComponent.selectDomainAddress( expectedDomainName );
			}
		);

		step( 'Can then enter account details and continue', async function() {
			const createYourAccountPage = await CreateYourAccountPage.Expect( driver );
			return await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				siteName,
				passwordForTestAccounts
			);
		} );

		step(
			'Can then see the sign up processing page which will finish automatically move along',
			async function() {
				if ( global.browserName === 'Internet Explorer' ) {
					return;
				}
				const signupProcessingPage = await SignupProcessingPage.Expect( driver );
				return await signupProcessingPage.waitToDisappear();
			}
		);

		step(
			'Can see checkout page, choose domain privacy option and enter registrar details',
			async function() {
				const checkOutPage = await CheckOutPage.Expect( driver );
				await checkOutPage.selectAddPrivacyProtectionCheckbox();
				await checkOutPage.enterRegistarDetails( testDomainRegistarDetails );
				return await checkOutPage.submitForm();
			}
		);

		step(
			'Can then see the secure payment page with the correct products in the cart',
			async function() {
				const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
				const domainInCart = await securePaymentComponent.containsDotLiveDomain();
				assert.strictEqual(
					domainInCart,
					true,
					"The cart doesn't contain the .live domain product"
				);
				const privateWhoISInCart = await securePaymentComponent.containsPrivateWhois();
				assert.strictEqual(
					privateWhoISInCart,
					true,
					"The cart doesn't contain the private domain product"
				);
				const businessPlanInCart = await securePaymentComponent.containsBusinessPlan();
				assert.strictEqual(
					businessPlanInCart,
					true,
					"The cart doesn't contain the business plan product"
				);
				const numberOfProductsInCart = await securePaymentComponent.numberOfProductsInCart();
				return assert.strictEqual(
					numberOfProductsInCart,
					3,
					"The cart doesn't contain the expected number of products"
				);
			}
		);

		step(
			'Can then see the secure payment page with the expected currency in the cart',
			async function() {
				const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
				if ( driverManager.currentScreenSize() === 'desktop' ) {
					const totalShown = await securePaymentComponent.cartTotalDisplayed();
					assert.strictEqual(
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

		step( 'Can enter/submit test payment details', async function() {
			const testCreditCardDetails = dataHelper.getTestCreditCardDetails();
			const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
			await securePaymentComponent.enterTestCreditCardDetails( testCreditCardDetails );
			await securePaymentComponent.submitPaymentDetails();
			await securePaymentComponent.waitForCreditCardPaymentProcessing();
			return await securePaymentComponent.waitForPageToDisappear();
		} );

		step( 'Can see the gsuite upsell page', async function() {
			const gSuiteUpsellPage = await GSuiteUpsellPage.Expect( driver );
			return await gSuiteUpsellPage.declineEmail();
		} );

		step( 'Can see the secure check out thank you page', async function() {
			return await CheckOutThankyouPage.Expect( driver );
		} );

		step( 'Can cancel the domain', async function() {
			return ( async () => {
				const navBarComponent = await NavBarComponent.Expect( driver );
				await navBarComponent.clickProfileLink();
				const profilePage = await ProfilePage.Expect( driver );
				await profilePage.chooseManagePurchases();

				let purchasesPage = await PurchasesPage.Expect( driver );
				await purchasesPage.dismissGuidedTour();
				await purchasesPage.selectBusinessPlan();

				const managePurchasePage = await ManagePurchasePage.Expect( driver );
				await managePurchasePage.chooseCancelAndRefund();

				const cancelPurchasePage = await CancelPurchasePage.Expect( driver );
				await cancelPurchasePage.chooseCancelPlanAndDomain();
				await cancelPurchasePage.clickCancelPurchase();
			} )().catch( err => {
				SlackNotifier.warn(
					`There was an error in the hooks that clean up the test account but since it is cleaning up we really don't care: '${ err }'`,
					{ suppressDuplicateMessages: true }
				);
			} );
		} );
	} );

	describe( 'Basic sign up for a free non-blog site @parallel @email @canary @ie11canary', function() {
		const blogName = dataHelper.getNewBlogName();
		let newBlogAddress = '';

		before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'Can visit the start page', async function() {
			await StartPage.Visit( driver, StartPage.getStartURL( { culture: locale } ) );
		} );

		step( 'Can see the about page and accept defaults', async function() {
			const aboutPage = await AboutPage.Expect( driver );
			await aboutPage.enterSiteDetails( blogName, '', {
				showcase: true,
			} );
			return await aboutPage.submitForm();
		} );

		step(
			'Can then see the domains page, and Can search for a blog name, can see and select a free .wordpress address in the results',
			async function() {
				const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
				const findADomainComponent = await FindADomainComponent.Expect( driver );
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

		step( 'Can then see the plans page and pick the free plan', async function() {
			const pickAPlanPage = await PickAPlanPage.Expect( driver );
			return await pickAPlanPage.selectFreePlan();
		} );

		step( 'Can then enter account details and continue', async function() {
			const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );
			const createYourAccountPage = await CreateYourAccountPage.Expect( driver );
			return await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				blogName,
				passwordForTestAccounts
			);
		} );

		step(
			"Can then see the sign up processing page -  will finish and show a 'Continue' button which is clicked",
			async function() {
				await SignupProcessingPage.hideFloatiesinIE11( driver );
				const signupProcessingPage = await SignupProcessingPage.Expect( driver );
				await signupProcessingPage.waitForContinueButtonToBeEnabled();
				return await signupProcessingPage.continueAlong();
			}
		);

		step( 'We are on the view blog page, can see trampoline, our URL and title', async function() {
			const viewBlogPage = await ViewBlogPage.Expect( driver );
			viewBlogPage.waitForTrampolineWelcomeMessage();
			let displayed = await viewBlogPage.isTrampolineWelcomeDisplayed();
			return assert.strictEqual(
				displayed,
				true,
				'The trampoline welcome message is not displayed'
			);
		} );

		step( 'Can see the correct blog URL displayed', async function() {
			const viewBlogPage = await ViewBlogPage.Expect( driver );
			const url = await viewBlogPage.urlDisplayed();
			return assert.strictEqual(
				url,
				'https://' + newBlogAddress + '/',
				'The displayed URL on the view blog page is not as expected'
			);
		} );
	} );

	describe( 'Basic sign up for a free blog @parallel @email', function() {
		const blogName = dataHelper.getNewBlogName();

		before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'Can visit the start page', async function() {
			await StartPage.Visit( driver, StartPage.getStartURL( { culture: locale } ) );
		} );

		step( 'Can see the about page and accept defaults', async function() {
			const aboutPage = await AboutPage.Expect( driver );
			await aboutPage.enterSiteDetails( blogName, '', {
				share: true,
			} );
			return await aboutPage.submitForm();
		} );

		step(
			'Can then see the domains page, and Can search for a blog name, can see and select a free .wordpress address in the results',
			async function() {
				const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
				const findADomainComponent = await FindADomainComponent.Expect( driver );
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

		step( 'Can then see the plans page and pick the free plan', async function() {
			const pickAPlanPage = await PickAPlanPage.Expect( driver );
			return await pickAPlanPage.selectFreePlan();
		} );

		step( 'Can then enter account details and continue', async function() {
			const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );
			const createYourAccountPage = await CreateYourAccountPage.Expect( driver );
			return await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				blogName,
				passwordForTestAccounts
			);
		} );

		step(
			"Can then see the sign up processing page -  will finish and show a 'Continue' button which is clicked",
			async function() {
				await SignupProcessingPage.hideFloatiesinIE11( driver );
				const signupProcessingPage = await SignupProcessingPage.Expect( driver );
				await signupProcessingPage.waitForContinueButtonToBeEnabled();
				return await signupProcessingPage.continueAlong();
			}
		);

		step( 'Can then see the onboarding checklist', async function() {
			const checklistPage = await ChecklistPage.Expect( driver );
			const header = await checklistPage.headerExists();
			const subheader = await checklistPage.subheaderExists();

			assert( header, 'The checklist header does not exist.' );

			return assert( subheader, 'The checklist subheader does not exist.' );
		} );
	} );

	describe( 'Sign up while purchasing premium theme in AUD currency @parallel @email', function() {
		const blogName = dataHelper.getNewBlogName();
		const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
		const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );
		const currencyValue = 'AUD';
		const expectedCurrencySymbol = 'A$';
		let chosenThemeName = '';

		before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'We can set the sandbox cookie for payments', async function() {
			const wPHomePage = await WPHomePage.Visit( driver );
			await wPHomePage.checkURL( locale );
			await wPHomePage.setSandboxModeForPayments( sandboxCookieValue );
			return await wPHomePage.setCurrencyForPayments( currencyValue );
		} );

		step( 'Can see the themes page and select premium theme ', async function() {
			const themesPage = await ThemesPage.Visit( driver, ThemesPage.getStartURL() );
			await themesPage.waitUntilThemesLoaded();
			await themesPage.setABTestControlGroupsInLocalStorage();
			await themesPage.showOnlyPremiumThemes();
			chosenThemeName = await themesPage.getFirstThemeName();
			return await themesPage.selectNewTheme();
		} );

		step( 'Can pick theme design', async function() {
			const themeDetailPage = await ThemeDetailPage.Expect( driver );
			return await themeDetailPage.pickThisDesign();
		} );

		step(
			'Can then see the domains page and can search for a blog name, can see and select a free WordPress.com blog address in results',
			async function() {
				const findADomainComponent = await FindADomainComponent.Expect( driver );
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

		step( 'Can then see the plans page and pick the free plan', async function() {
			const pickAPlanPage = await PickAPlanPage.Expect( driver );
			return await pickAPlanPage.selectFreePlan();
		} );

		step( 'Can then enter account details and continue', async function() {
			const createYourAccountPage = await CreateYourAccountPage.Expect( driver );
			return await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				blogName,
				passwordForTestAccounts
			);
		} );

		step(
			"Can then see the sign up processing page -  will finish and show a 'Continue' button which is clicked",
			async function() {
				const signupProcessingPage = await SignupProcessingPage.Expect( driver );
				await signupProcessingPage.waitForContinueButtonToBeEnabled();
				return await signupProcessingPage.continueAlong();
			}
		);

		step(
			'Can then see the secure payment page with the chosen theme in the cart',
			async function() {
				const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
				let products = await securePaymentComponent.getProductsNames();
				assert(
					products[ 0 ].search( chosenThemeName ),
					`First product in cart is not ${ chosenThemeName }`
				);
				const numberOfProductsInCart = await securePaymentComponent.numberOfProductsInCart();
				return assert.strictEqual(
					numberOfProductsInCart,
					1,
					"The cart doesn't contain the expected number of products"
				);
			}
		);

		step(
			'Can then see the secure payment page with the expected currency in the cart',
			async function() {
				const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
				if ( driverManager.currentScreenSize() === 'desktop' ) {
					const totalShown = await securePaymentComponent.cartTotalDisplayed();
					assert.strictEqual(
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

		step( 'Can delete our newly created account', async function() {
			return ( async () => {
				const navBarComponent = await NavBarComponent.Expect( driver );
				await navBarComponent.clickProfileLink();
				const profilePage = await ProfilePage.Expect( driver );
				await profilePage.chooseAccountSettings();
				const accountSettingsPage = await AccountSettingsPage.Expect( driver );
				await accountSettingsPage.chooseCloseYourAccount();
				const closeAccountPage = await CloseAccountPage.Expect( driver );
				await closeAccountPage.chooseCloseAccount();
				await closeAccountPage.enterAccountNameAndClose( blogName );
				await LoggedOutMasterbarComponent.Expect( driver );
			} )().catch( err => {
				SlackNotifier.warn(
					`There was an error in the hooks that clean up the test account but since it is cleaning up we really don't care: '${ err }'`,
					{ suppressDuplicateMessages: true }
				);
			} );
		} );
	} );

	describe( 'Sign up for free subdomain site @parallel', function() {
		const blogName = dataHelper.getNewBlogName();
		const expectedDomainName = `${ blogName }.art.blog`;

		before( async function() {
			await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'Can enter the subdomains flow and select design type', async function() {
			await StartPage.Visit(
				driver,
				StartPage.getStartURL( {
					culture: locale,
					flow: 'subdomain',
					query: 'vertical=a8c.1',
				} )
			);
			const designTypePage = await DesignTypePage.Expect( driver );
			return await designTypePage.selectFirstDesignType();
		} );

		step(
			'Can see the choose a theme page as the starting page, and select the first theme',
			async function() {
				const chooseAThemePage = await ChooseAThemePage.Expect( driver );
				return await chooseAThemePage.selectFirstTheme();
			}
		);

		step(
			'Can then see the domains page, and Can search for a blog name, can see and select a free .art.blog address in the results',
			async function() {
				const findADomainComponent = await FindADomainComponent.Expect( driver );
				await findADomainComponent.searchForBlogNameAndWaitForResults( blogName );
				await findADomainComponent.checkAndRetryForFreeBlogAddresses(
					expectedDomainName,
					blogName
				);
				let actualAddress = await findADomainComponent.freeBlogAddress();
				assert(
					expectedDomainName.indexOf( actualAddress ) > -1,
					`The displayed blog address: '${ actualAddress }' was not the expected addresses: '${ expectedDomainName }'`
				);
				return await findADomainComponent.selectFreeAddress();
			}
		);

		step( 'Can then see the plans page and pick the free plan', async function() {
			const pickAPlanPage = await PickAPlanPage.Expect( driver );
			return await pickAPlanPage.selectFreePlan();
		} );

		step( 'Can then enter account details and continue', async function() {
			const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );
			const createYourAccountPage = await CreateYourAccountPage.Expect( driver );
			return await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				blogName,
				passwordForTestAccounts
			);
		} );

		step(
			"Can then see the sign up processing page -  will finish and show a 'Continue' button which is clicked",
			async function() {
				const signupProcessingPage = await SignupProcessingPage.Expect( driver );
				await signupProcessingPage.waitForContinueButtonToBeEnabled();
				return await signupProcessingPage.continueAlong();
			}
		);

		step( 'Can then see the onboarding checklist', async function() {
			const checklistPage = await ChecklistPage.Expect( driver );
			const header = await checklistPage.headerExists();
			const subheader = await checklistPage.subheaderExists();

			assert( header, 'The checklist header does not exist.' );

			return assert( subheader, 'The checklist subheader does not exist.' );
		} );
	} );

	describe( 'Sign up for an account only (no site) @parallel', function() {
		const userName = dataHelper.getNewBlogName();

		before( async function() {
			await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'Can enter the account flow and see the account details page', async function() {
			await StartPage.Visit(
				driver,
				StartPage.getStartURL( {
					culture: locale,
					flow: 'account',
				} )
			);
			await CreateYourAccountPage.Expect( driver );
		} );

		step( 'Can then enter account details and continue', async function() {
			const emailAddress = dataHelper.getEmailAddress( userName, signupInboxId );
			const createYourAccountPage = await CreateYourAccountPage.Expect( driver );
			return await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				userName,
				passwordForTestAccounts
			);
		} );

		step(
			"Can then see the sign up processing page -  will finish and show a 'Continue' button which is clicked",
			async function() {
				const signupProcessingPage = await SignupProcessingPage.Expect( driver );
				await signupProcessingPage.waitForContinueButtonToBeEnabled();
				return await signupProcessingPage.continueAlong();
			}
		);

		step( 'We are then on the Reader page and have no sites', async function() {
			await ReaderPage.Expect( driver );
			const navBarComponent = await NavBarComponent.Expect( driver );
			await navBarComponent.clickMySites();
			await NoSitesComponent.Expect( driver );
		} );
	} );
} );
