/** @format */

import config from 'config';
import assert from 'assert';

import * as driverManager from '../lib/driver-manager.js';
import * as driverHelper from '../lib/driver-helper.js';
import * as dataHelper from '../lib/data-helper.js';

import StartPage from '../lib/pages/signup/start-page.js';

import AboutPage from '../lib/pages/signup/about-page.js';
import PickAPlanPage from '../lib/pages/signup/pick-a-plan-page.js';
import CreateYourAccountPage from '../lib/pages/signup/create-your-account-page.js';

import FindADomainComponent from '../lib/components/find-a-domain-component.js';
import SecurePaymentComponent from '../lib/components/secure-payment-component.js';
import SidebarComponent from '../lib/components/sidebar-component';

import SignUpStep from '../lib/flows/sign-up-step';
import LoginFlow from '../lib/flows/login-flow';
import StatsPage from '../lib/pages/stats-page';
import PlansPage from '../lib/pages/plans-page';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const signupInboxId = config.get( 'signupInboxId' );
const host = dataHelper.getJetpackHost();
const locale = driverManager.currentLocale();
const passwordForTestAccounts = config.get( 'passwordForNewTestSignUps' );

let driver;

before( async function() {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( `[${ host }] Sign Up  (${ screenSize }, ${ locale })`, function() {
	this.timeout( mochaTimeOut );

	describe( 'Sign up for a non-blog site on a premium paid plan through main flow in USD currency using a coupon @parallel @visdiff', function() {
		const blogName = dataHelper.getNewBlogName();
		const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
		const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );
		const expectedCurrencySymbol = '$';
		let originalCartAmount;

		before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'Can visit the start page', async function() {
			await StartPage.Visit( driver, StartPage.getStartURL( { culture: locale } ) );
		} );

		step( 'Can see the account page and enter account details', async function() {
			const createYourAccountPage = await CreateYourAccountPage.Expect( driver );
			return await createYourAccountPage.enterAccountDetailsAndSubmit(
				emailAddress,
				blogName,
				passwordForTestAccounts
			);
		} );

		step( 'Can see the "About" page, and enter some site information', async function() {
			const aboutPage = await AboutPage.Expect( driver );
			return await aboutPage.enterSiteDetails( blogName, '', {
				showcase: true,
			} );
		} );

		step( 'Can accept defaults for about page', async function() {
			const aboutPage = await AboutPage.Expect( driver );
			await aboutPage.submitForm();
		} );

		step( 'Can then see the domains page ', async function() {
			const findADomainComponent = await FindADomainComponent.Expect( driver );
			let displayed = await findADomainComponent.displayed();
			return assert.strictEqual( displayed, true, 'The choose a domain page is not displayed' );
		} );

		step(
			'Can search for a blog name, can see and select a free WordPress.com blog address in results',
			async function() {
				return await new SignUpStep( driver ).selectFreeWordPressDotComAddresss(
					blogName,
					expectedBlogAddresses
				);
			}
		);

		step( 'Can then see the plans page and select the premium plan ', async function() {
			const pickAPlanPage = await PickAPlanPage.Expect( driver );
			let displayed = await pickAPlanPage.displayed();
			assert.strictEqual( displayed, true, 'The pick a plan page is not displayed' );
			return await pickAPlanPage.selectPremiumPlan();
		} );

		step(
			'Can then see the sign up processing page which will automatically move along',
			async function() {
				return await new SignUpStep( driver ).continueAlong( blogName, passwordForTestAccounts );
			}
		);

		step(
			'Can then see the secure payment page with the premium plan in the cart',
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

		step( 'Can Correctly Apply Coupon discount', async function() {
			const securePaymentComponent = await SecurePaymentComponent.Expect( driver );
			await securePaymentComponent.toggleCartSummary();
			originalCartAmount = await securePaymentComponent.cartTotalAmount();

			await securePaymentComponent.enterCouponCode( dataHelper.getTestCouponCode() );

			let newCartAmount = await securePaymentComponent.cartTotalAmount();
			let expectedCartAmount = parseFloat( ( originalCartAmount * 0.99 ).toFixed( 2 ) );
			assert.strictEqual( newCartAmount, expectedCartAmount, 'Coupon not applied properly' );
		} );

		step( 'Can Remove Coupon', async function() {
			const securePaymentComponent = await SecurePaymentComponent.Expect( driver );

			await securePaymentComponent.removeCoupon();

			let removedCouponAmount = await securePaymentComponent.cartTotalAmount();
			assert.strictEqual( removedCouponAmount, originalCartAmount, 'Coupon not removed properly' );
		} );

		after( async function() {
			await driver.sleep( 2000 );
			return await driverHelper.clear_cache( driver );
		} );
	} );

	describe( 'Viewing a specific plan with coupon:', function() {
		let originalCartAmount, loginFlow;

		before( async function() {
			return await driverManager.ensureNotLoggedIn( driver );
		} );

		step( 'Login and Select My Site', async function() {
			loginFlow = new LoginFlow( driver );
			return await loginFlow.loginAndSelectMySite();
		} );

		step( 'Can Select Plans', async function() {
			const statsPage = await StatsPage.Expect( driver );
			await statsPage.waitForPage();
			const sideBarComponent = await SidebarComponent.Expect( driver );
			return await sideBarComponent.selectPlan();
		} );

		step( 'Can Select Plans tab', async function() {
			const plansPage = await PlansPage.Expect( driver );
			if ( host === 'WPCOM' ) {
				await plansPage.openPlansTab();
				return await plansPage.waitForComparison();
			}

			// Jetpack
			const displayed = await plansPage.planTypesShown( 'jetpack' );
			return assert( displayed, 'The Jetpack plans are NOT displayed' );
		} );

		step( 'Select Business Plan', async function() {
			const plansPage = await PlansPage.Expect( driver );
			return await plansPage.selectBusinessPlan();
		} );

		step( 'Remove any existing coupon', async function() {
			const securePaymentComponent = await SecurePaymentComponent.Expect( driver );

			if ( await securePaymentComponent.hasCouponApplied() ) {
				await securePaymentComponent.removeCoupon();
			}
		} );

		step( 'Can Correctly Apply Coupon', async function() {
			const securePaymentComponent = await SecurePaymentComponent.Expect( driver );

			await securePaymentComponent.toggleCartSummary();
			originalCartAmount = await securePaymentComponent.cartTotalAmount();

			await securePaymentComponent.enterCouponCode( dataHelper.getTestCouponCode() );

			let newCartAmount = await securePaymentComponent.cartTotalAmount();
			let expectedCartAmount = parseFloat( ( originalCartAmount * 0.99 ).toFixed( 2 ) );

			assert.strictEqual( newCartAmount, expectedCartAmount, 'Coupon not applied properly' );
		} );

		step( 'Can Remove Coupon', async function() {
			const securePaymentComponent = await SecurePaymentComponent.Expect( driver );

			await securePaymentComponent.removeCoupon();

			let removedCouponAmount = await securePaymentComponent.cartTotalAmount();
			assert.strictEqual( removedCouponAmount, originalCartAmount, 'Coupon not removed properly' );
		} );

		step( 'Remove from cart', async function() {
			const securePaymentComponent = await SecurePaymentComponent.Expect( driver );

			return await securePaymentComponent.removeFromCart();
		} );
	} );
} );
