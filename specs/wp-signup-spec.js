import test from 'selenium-webdriver/testing';
import config from 'config';
import assert from 'assert';
import * as ccGenerator from 'creditcard-generator';

import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper.js';

import WPHomePage from '../lib/pages/wp-home-page.js';
import ChooseAThemePage from '../lib/pages/signup/choose-a-theme-page.js';
import StartPage from '../lib/pages/signup/start-page.js';
import SurveyPage from '../lib/pages/signup/survey-page.js';
import DesignTypeChoicePage from '../lib/pages/signup/design-type-choice-page.js';
import PickAPlanPage from '../lib/pages/signup/pick-a-plan-page.js';
import CreateYourAccountPage from '../lib/pages/signup/create-your-account-page.js';
import SignupProcessingPage from '../lib/pages/signup/signup-processing-page.js';
import CheckOutPage from '../lib/pages/signup/checkout-page';
import CheckOutThankyouPage from '../lib/pages/signup/checkout-thankyou-page.js';
import ViewBlogPage from '../lib/pages/signup/view-blog-page.js';

import FindADomainComponent from '../lib/components/find-a-domain-component.js';
import SecurePaymentComponent from '../lib/components/secure-payment-component.js';

import * as SlackNotifier from '../lib/slack-notifier';

import EmailClient from '../lib/email-client.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const signupInboxId = config.get( 'signupInboxId' );

var driver;

test.before( 'Start Browser', function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

// Faked out test.describe function to enable dynamic skipping of e-mail tests
let testDescribe = test.describe;
if ( process.env.DISABLE_EMAIL === 'true' ) {
	SlackNotifier.warn( 'WARNING::: Any test that uses email is currently disabled as DISABLE_EMAIL is set to true' );
	testDescribe = test.xdescribe;
}

testDescribe( 'Sign Up (' + screenSize + ')', function() {
	this.timeout( mochaTimeOut );

	test.describe( 'Sign up for a free site', function() {
		this.bailSuite( true );

		const blogName = dataHelper.getNewBlogName();
		let newBlogAddress = '';
		const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
		const emailName = new Date().getTime().toString();
		const emailAddress = dataHelper.getEmailAddress( emailName, signupInboxId );
		const password = config.get( 'passwordForNewTestSignUps' );

		test.it( 'Ensure we are not logged in as anyone', function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.describe( 'Step One: Design Type Choice', function() {
			test.it( 'Can see the design type choice page', function() {
				this.startPage = new StartPage( driver, { visit: true } );
				this.designTypeChoicePage = new DesignTypeChoicePage( driver );
				return this.designTypeChoicePage.displayed().then( ( displayed ) => {
					return assert.equal( displayed, true, 'The design type choice page is not displayed' );
				} );
			} );

			test.it( 'Can select the first design type', function() {
				this.designTypeChoicePage.selectFirstDesignType();
			} );

			test.describe( 'Step Two: Themes', function() {
				test.it( 'Can see the choose a theme page', function() {
					this.chooseAThemePage = new ChooseAThemePage( driver );
					return this.chooseAThemePage.displayed().then( ( displayed ) => {
						return assert.equal( displayed, true, 'The choose a theme start page is not displayed' );
					} );
				} );

				test.it( 'Can select the first theme', function() {
					this.chooseAThemePage.selectFirstTheme();
				} );

				test.describe( 'Step Three: Domains', function() {
					test.it( 'Can then see the domains page ', function() {
						this.findADomainComponent = new FindADomainComponent( driver );
						return this.findADomainComponent.displayed().then( ( displayed ) => {
							return assert.equal( displayed, true, 'The choose a domain page is not displayed' );
						} );
					} );

					test.it( 'Can search for a blog name, can see and select a free .wordpress address in the results', function() {
						this.findADomainComponent.searchForBlogNameAndWaitForResults( blogName );
						this.findADomainComponent.checkAndRetryForFreeBlogAddresses( expectedBlogAddresses, blogName );
						this.findADomainComponent.freeBlogAddress().then( ( actualAddress ) => {
							assert( expectedBlogAddresses.indexOf( actualAddress ) > -1, `The displayed free blog address: '${actualAddress}' was not the expected addresses: '${expectedBlogAddresses}'` );
							newBlogAddress = actualAddress;
						} );
						return this.findADomainComponent.selectFreeAddress();
					} );

					test.describe( 'Step Four: Plans', function() {
						test.it( 'Can then see the plans page', function() {
							this.pickAPlanPage = new PickAPlanPage( driver );
							return this.pickAPlanPage.displayed().then( ( displayed ) => {
								return assert.equal( displayed, true, 'The pick a plan page is not displayed' );
							} );
						} );

						test.it( 'Can select the free plan', function() {
							return this.pickAPlanPage.selectFreePlan();
						} );

						test.describe( 'Step Five: Account', function() {
							test.it( 'Can then see the account page', function() {
								this.createYourAccountPage = new CreateYourAccountPage( driver );
								return this.createYourAccountPage.displayed().then( ( displayed ) => {
									return assert.equal( displayed, true, 'The create account page is not displayed' );
								} );
							} );

							test.it( 'Can then enter account details', function() {
								return this.createYourAccountPage.enterAccountDetailsAndSubmit( emailAddress, blogName, password );
							} );

							test.describe( 'Step Six: Sign Up Processing', function() {
								test.it( 'Can then see the sign up processing page', function() {
									this.signupProcessingPage = new SignupProcessingPage( driver );
									return this.signupProcessingPage.displayed().then( ( displayed ) => {
										return assert.equal( displayed, true, 'The sign up processing page is not displayed' );
									} );
								} );

								test.it( 'The sign up processing page will finish and show a \'Continue\' button', function() {
									this.signupProcessingPage.waitForContinueButtonToBeEnabled();
								} );

								test.it( 'Clicking the \'Continue\' button continues the process', function() {
									this.signupProcessingPage.continueAlong();
								} );

								test.describe( 'Step Seven: View Site/Trampoline', function() {
									test.it( 'We are on the view blog page, can see trampoline, our URL and title', function() {
										return this.viewBlogPage = new ViewBlogPage( driver );
									} );

									test.it( 'Can see the trampoline welcome message displayed', function() {
										this.viewBlogPage.waitForTrampolineWelcomeMessage();
										return this.viewBlogPage.isTrampolineWelcomeDisplayed().then( ( displayed ) => {
											return assert.equal( displayed, true, 'The trampoline welcome message is not displayed' );
										} );
									} );

									test.it( 'Can see the correct blog URL displayed', function() {
										return this.viewBlogPage.urlDisplayed().then( ( url ) => {
											return assert.equal( url, 'https://' + newBlogAddress + '/', 'The displayed URL on the view blog page is not as expected' );
										} );
									} );

									test.it( 'Can see the correct blog title displayed', function() {
										return this.viewBlogPage.title().then( ( title ) => {
											return assert.equal( title, 'Site Title', 'The expected blog title is not displaying correctly' );
										} );
									} );

									test.describe( 'Step Eight: Can activate my account from an email', function() {
										test.before( function() {
											return this.emailClient = new EmailClient( signupInboxId );
										} );

										test.it( 'Can see a single activation message', function() {
											return this.emailClient.pollEmailsByRecipient( emailAddress ).then( function( emails ) {
												return assert.equal( emails.length, 1, 'The number of invite emails is not equal to 1' );
											} );
										} );
									} );
								} );
							} );
						} );
					} );
				} );
			} );
		} );
	} );

	test.describe( 'Sign up for a site on a premium paid plan through main flow', function() {
		this.bailSuite( true );

		const blogName = dataHelper.getNewBlogName();
		const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
		const emailName = new Date().getTime().toString();
		const emailAddress = dataHelper.getEmailAddress( emailName, signupInboxId );
		const password = config.get( 'passwordForNewTestSignUps' );
		const sandboxCookieValue = config.get( 'storeSandboxCookieValue' );
		const testCardHolder = 'End To End Testing';
		const testVisaNumber = '4242424242424242'; // https://stripe.com/docs/testing#cards
		const testVisaExpiry = '02/19';
		const testCVV = '300';
		const testCardCountryCode = 'TR'; // using Turkey to force Stripe as payment processor
		const testCardPostCode = '4000';

		test.it( 'Ensure we are not logged in as anyone', function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'We can set the sandbox cookie for payments', function() {
			this.WPHomePage = new WPHomePage( driver, { visit: true } );
			this.WPHomePage.setSandboxModeForPayments( sandboxCookieValue );
		} );

		test.describe( 'Step One: Design Type Choice', function() {
			test.it( 'Can see the design type choice page', function() {
				this.startPage = new StartPage( driver, { visit: true } );
				this.designTypeChoicePage = new DesignTypeChoicePage( driver );
				return this.designTypeChoicePage.displayed().then( ( displayed ) => {
					return assert.equal( displayed, true, 'The design type choice page is not displayed' );
				} );
			} );

			test.it( 'Can select the first design type', function() {
				this.designTypeChoicePage.selectFirstDesignType();
			} );

			test.describe( 'Step Two: Themes', function() {
				test.it( 'Can see the choose a theme page as the starting page', function() {
					this.chooseAThemePage = new ChooseAThemePage( driver );
					return this.chooseAThemePage.displayed().then( ( displayed ) => {
						return assert.equal( displayed, true, 'The choose a theme start page is not displayed' );
					} );
				} );

				test.it( 'Can select the first theme', function() {
					return this.chooseAThemePage.selectFirstTheme();
				} );

				test.describe( 'Step Three: Domains', function() {
					test.it( 'Can then see the domains page ', function() {
						this.findADomainComponent = new FindADomainComponent( driver );
						return this.findADomainComponent.displayed().then( ( displayed ) => {
							return assert.equal( displayed, true, 'The choose a domain page is not displayed' );
						} );
					} );

					test.it( 'Can search for a blog name, can see and select a free WordPress.com blog address in results', function() {
						this.findADomainComponent.searchForBlogNameAndWaitForResults( blogName );
						this.findADomainComponent.checkAndRetryForFreeBlogAddresses( expectedBlogAddresses, blogName );
						this.findADomainComponent.freeBlogAddress().then( ( actualAddress ) => {
							assert( expectedBlogAddresses.indexOf( actualAddress ) > -1, `The displayed free blog address: '${actualAddress}' was not the expected addresses: '${expectedBlogAddresses}'` );
						} );
						return this.findADomainComponent.selectFreeAddress();
					} );

					test.describe( 'Step Four: Plans', function() {
						test.it( 'Can then see the plans page', function() {
							this.pickAPlanPage = new PickAPlanPage( driver );
							return this.pickAPlanPage.displayed().then( ( displayed ) => {
								return assert.equal( displayed, true, 'The pick a plan page is not displayed' );
							} );
						} );

						test.it( 'Can select the premium plan', function() {
							return this.pickAPlanPage.selectPremiumPlan();
						} );

						test.describe( 'Step Five: Account', function() {
							test.it( 'Can then enter account details', function() {
								this.createYourAccountPage = new CreateYourAccountPage( driver );
								this.createYourAccountPage.displayed().then( ( displayed ) => {
									assert.equal( displayed, true, 'The create account page is not displayed' );
								} );
								return this.createYourAccountPage.enterAccountDetailsAndSubmit( emailAddress, blogName, password );
							} );

							test.describe( 'Step Six: Processing', function() {
								test.it( 'Can then see the sign up processing page which will automatically move along', function() {
									this.signupProcessingPage = new SignupProcessingPage( driver );
									return this.signupProcessingPage.waitToDisappear();
								} );

								test.describe( 'Step Seven: Secure Payment Page', function() {
									test.it( 'Can then see the secure payment page', function() {
										this.securePaymentComponent = new SecurePaymentComponent( driver );
										return this.securePaymentComponent.displayed().then( ( displayed ) => {
											return assert.equal( displayed, true, 'The secure payment page is not displayed' );
										} );
									} );

									test.it( 'Can enter and submit test payment details', function() {
										this.securePaymentComponent.enterTestCreditCardDetails( testCardHolder, testVisaNumber, testVisaExpiry, testCVV, testCardCountryCode, testCardPostCode );
										this.securePaymentComponent.submitPaymentDetails();
										return this.securePaymentComponent.waitForPageToDisappear();
									} );

									test.describe( 'Step Eight: Checkout Thank You Page', function() {
										test.it( 'Can see the secure check out thank you page', function() {
											this.CheckOutThankyouPage = new CheckOutThankyouPage( driver );
											return this.CheckOutThankyouPage.displayed().then( ( displayed ) => {
												return assert.equal( displayed, true, 'The checkout thank you page is not displayed' );
											} );
										} );
									} );
								} );
							} );
						} );
					} );
				} );
			} );
		} );
	} );

	test.describe( 'Sign up for a site on a premium paid plan coming in via /create as premium flow', function() {
		this.bailSuite( true );

		const blogName = dataHelper.getNewBlogName();
		const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
		const emailName = new Date().getTime().toString();
		const emailAddress = dataHelper.getEmailAddress( emailName, signupInboxId );
		const password = config.get( 'passwordForNewTestSignUps' );
		const sandboxCookieValue = config.get( 'storeSandboxCookieValue' );
		const testCardHolder = 'End To End Testing';
		const testVisaNumber = '4242424242424242'; // https://stripe.com/docs/testing#cards
		const testVisaExpiry = '02/19';
		const testCVV = '301';
		const testCardCountryCode = 'TR'; // using Turkey to force Stripe as payment processor
		const testCardPostCode = '4000';

		test.it( 'Ensure we are not logged in as anyone', function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'We can set the sandbox cookie for payments', function() {
			this.WPHomePage = new WPHomePage( driver, { visit: true } );
			this.WPHomePage.setSandboxModeForPayments( sandboxCookieValue );
		} );


		test.describe( 'Step One: Design Type Choice', function() {
			test.it( 'Can see the design type choice page', function() {
				this.startPage = new StartPage( driver, { visit: true, flow: 'premium' } );
				this.designTypeChoicePage = new DesignTypeChoicePage( driver );
				return this.designTypeChoicePage.displayed().then( ( displayed ) => {
					return assert.equal( displayed, true, 'The design type choice page is not displayed' );
				} );
			} );

			test.it( 'Can select the first design type', function() {
				this.designTypeChoicePage.selectFirstDesignType();
			} );

			test.describe( 'Step Two: Themes', function() {
				test.it( 'Can see the choose a theme page as the starting page', function() {
					this.chooseAThemePage = new ChooseAThemePage( driver );
					return this.chooseAThemePage.displayed().then( ( displayed ) => {
						return assert.equal( displayed, true, 'The choose a theme start page is not displayed' );
					} );
				} );

				test.it( 'Can select the first theme', function() {
					return this.chooseAThemePage.selectFirstTheme();
				} );

				test.describe( 'Step Three: Domains', function() {
					test.it( 'Can then see the domains page ', function() {
						this.findADomainComponent = new FindADomainComponent( driver );
						return this.findADomainComponent.displayed().then( ( displayed ) => {
							return assert.equal( displayed, true, 'The choose a domain page is not displayed' );
						} );
					} );

					test.it( 'Can search for a blog name, can see and select a free WordPress.com blog address in results', function() {
						this.findADomainComponent.searchForBlogNameAndWaitForResults( blogName );
						this.findADomainComponent.checkAndRetryForFreeBlogAddresses( expectedBlogAddresses, blogName );
						this.findADomainComponent.freeBlogAddress().then( ( actualAddress ) => {
							assert( expectedBlogAddresses.indexOf( actualAddress ) > -1, `The displayed free blog address: '${actualAddress}' was not the expected addresses: '${expectedBlogAddresses}'` );
						} );
						return this.findADomainComponent.selectFreeAddress();
					} );

					test.describe( 'Step Four: Account', function() {
						test.it( 'Can then enter account details', function() {
							this.createYourAccountPage = new CreateYourAccountPage( driver );
							this.createYourAccountPage.displayed().then( ( displayed ) => {
								assert.equal( displayed, true, 'The create account page is not displayed' );
							} );
							return this.createYourAccountPage.enterAccountDetailsAndSubmit( emailAddress, blogName, password );
						} );

						test.describe( 'Step Five: Processing', function() {
							test.it( 'Can then see the sign up processing page', function() {
								this.signupProcessingPage = new SignupProcessingPage( driver );
								return this.signupProcessingPage.displayed().then( ( displayed ) => {
									return assert.equal( displayed, true, 'The sign up processing page is not displayed' );
								} );
							} );

							// test.it( 'The sign up processing page will finish automatically move along', function() {
							// 	this.signupProcessingPage.waitToDisappear();
							// } );

							test.it( 'The sign up processing page will finish and show a \'Continue\' button', function() {
								this.signupProcessingPage.waitForContinueButtonToBeEnabled();
							} );

							test.it( 'Clicking the \'Continue\' button continues the process', function() {
								this.signupProcessingPage.continueAlong();
							} );

							test.describe( 'Step Six: Secure Payment Page', function() {
								test.it( 'Can then see the secure payment page', function() {
									this.securePaymentComponent = new SecurePaymentComponent( driver );
									return this.securePaymentComponent.displayed().then( ( displayed ) => {
										return assert.equal( displayed, true, 'The secure payment page is not displayed' );
									} );
								} );

								test.it( 'Can enter and submit test payment details', function() {
									this.securePaymentComponent.enterTestCreditCardDetails( testCardHolder, testVisaNumber, testVisaExpiry, testCVV, testCardCountryCode, testCardPostCode );
									this.securePaymentComponent.submitPaymentDetails();
									return this.securePaymentComponent.waitForPageToDisappear();
								} );

								test.describe( 'Step Seven: Checkout Thank You Page', function() {
									test.it( 'Can see the secure check out thank you page', function() {
										this.CheckOutThankyouPage = new CheckOutThankyouPage( driver );
										return this.CheckOutThankyouPage.displayed().then( ( displayed ) => {
											return assert.equal( displayed, true, 'The checkout thank you page is not displayed' );
										} );
									} );
								} );
							} );
						} );
					} );
				} );
			} );
		} );
	} );

	test.describe( 'Partially sign up for a site on a business paid plan w/ domain name coming in via /create as business flow', function() {
		this.bailSuite( true );

		const siteName = dataHelper.getNewBlogName();
		const emailName = new Date().getTime().toString();
		const expectedDomainName = `${siteName}.com`;
		const emailAddress = dataHelper.getEmailAddress( emailName, signupInboxId );
		const password = config.get( 'passwordForNewTestSignUps' );
		const sandboxCookieValue = config.get( 'storeSandboxCookieValue' );
		const testCardHolder = 'End To End Testing';
		const testVisaNumber = '4242424242424242'; // https://stripe.com/docs/testing#cards
		const testVisaExpiry = '02/19';
		const testCVV = '303';
		const testCardCountryCode = 'TR'; // using Turkey to force Stripe as payment processor
		const testCardPostCode = '4000';
		const firstName = 'End to End';
		const lastName = 'Testing';
		const phoneNumber = '+04.22888888';
		const countryCode = 'AU';
		const address = '888 Queen Street';
		const city = 'Brisbane';
		const stateCode = 'QLD';
		const postalCode = '4000';

		test.it( 'Ensure we are not logged in as anyone', function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'We can set the sandbox cookie for payments', function() {
			this.WPHomePage = new WPHomePage( driver, { visit: true } );
			this.WPHomePage.setSandboxModeForPayments( sandboxCookieValue );
		} );

		test.describe( 'Step Two: Design Type Choice', function() {
			test.it( 'Can see the design type choice page', function() {
				this.startPage = new StartPage( driver, { visit: true, flow: 'business' } );

				this.designTypeChoicePage = new DesignTypeChoicePage( driver );
				return this.designTypeChoicePage.displayed().then( ( displayed ) => {
					return assert.equal( displayed, true, 'The design type choice page is not displayed' );
				} );
			} );

			test.it( 'Can select the first design type', function() {
				this.designTypeChoicePage.selectFirstDesignType();
			} );

			test.describe( 'Step Three: Themes', function() {
				test.it( 'Can see the choose a theme page as the starting page', function() {
					this.chooseAThemePage = new ChooseAThemePage( driver );
					return this.chooseAThemePage.displayed().then( ( displayed ) => {
						return assert.equal( displayed, true, 'The choose a theme start page is not displayed' );
					} );
				} );

				test.it( 'Can select the first theme', function() {
					return this.chooseAThemePage.selectFirstTheme();
				} );

				test.describe( 'Step Four: Domains', function() {
					test.it( 'Can then see the domains page ', function() {
						this.findADomainComponent = new FindADomainComponent( driver );
						return this.findADomainComponent.displayed().then( ( displayed ) => {
							return assert.equal( displayed, true, 'The choose a domain page is not displayed' );
						} );
					} );

					test.it( 'Can search for a blog name, can see and select a paid .com address in results', function() {
						this.findADomainComponent.searchForBlogNameAndWaitForResults( siteName );
						return this.findADomainComponent.selectDotComAddress( expectedDomainName );
					} );

					test.describe( 'Step Five: Account', function() {
						test.it( 'Can then enter account details', function() {
							this.createYourAccountPage = new CreateYourAccountPage( driver );
							this.createYourAccountPage.displayed().then( ( displayed ) => {
								assert.equal( displayed, true, 'The create account page is not displayed' );
							} );
							return this.createYourAccountPage.enterAccountDetailsAndSubmit( emailAddress, siteName, password );
						} );

						test.describe( 'Step Six: Processing', function() {
							test.it( 'Can then see the sign up processing page which will finish automatically move along', function() {
								this.signupProcessingPage = new SignupProcessingPage( driver );
								return this.signupProcessingPage.waitToDisappear();
							} );

							test.describe( 'Step Seven: Secure Payment Page', function() {
								test.it( 'Can see checkout page', () => {
									this.checkOutPage = new CheckOutPage( driver );
									this.checkOutPage.displayed().then( ( displayed ) => {
										assert.equal( displayed, true, 'Could not see the check out page' );
									} );
								} );

								test.it( 'Can choose domain privacy option', () => {
									this.checkOutPage = new CheckOutPage( driver );
									this.checkOutPage.selectAddPrivacyProtectionCheckbox();
								} );

								test.it( 'Can enter domain registrar details', () => {
									this.checkOutPage = new CheckOutPage( driver );
									this.checkOutPage.enterRegistarDetails( firstName, lastName, emailAddress, phoneNumber, countryCode, address, city, stateCode, postalCode );
									this.checkOutPage.submitForm();
								} );

								test.it( 'Can then see secure payment component', () => {
									this.securePaymentComponent = new SecurePaymentComponent( driver );
									this.securePaymentComponent.displayed().then( ( displayed ) => {
										assert.equal( displayed, true, 'Could not see the secure payment component' );
									} );
								} );

								test.it( 'Can enter and submit test payment details', function() {
									this.securePaymentComponent = new SecurePaymentComponent( driver );
									return this.securePaymentComponent.enterTestCreditCardDetails( testCardHolder, testVisaNumber, testVisaExpiry, testCVV, testCardCountryCode, testCardPostCode );
								} );
							} );
						} );
					} );
				} );
			} );
		} );
	} );


	test.describe( 'Sign up for a free site with Survey step', function() {
		this.bailSuite( true );

		const blogName = dataHelper.getNewBlogName();
		let newBlogAddress = '';
		const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
		const emailName = new Date().getTime().toString();
		const emailAddress = dataHelper.getEmailAddress( emailName, signupInboxId );
		const password = config.get( 'passwordForNewTestSignUps' );

		test.it( 'Ensure we are not logged in as anyone', function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.describe( 'Step One: Survey', function() {
			test.it( 'When we visit the start URL we see the survey page', function() {
				this.startPage = new StartPage( driver, { visit: true, flow: 'surveystep' } );
				this.surveyPage = new SurveyPage( driver );
				return this.surveyPage.displayed().then( ( displayed ) => {
					return assert.equal( displayed, true, 'The survey starting page is not displayed' );
				} );
			} );

			test.it( 'Can select the first survey option', function() {
				this.surveyPage.selectOtherSurveyOption( 'e2e Automated Testing' );
			} );

			test.describe( 'Step Two: Design Type Choice', function() {
				test.it( 'Can see the design type choice page', function() {
					this.designTypeChoicePage = new DesignTypeChoicePage( driver );
					return this.designTypeChoicePage.displayed().then( ( displayed ) => {
						return assert.equal( displayed, true, 'The design type choice page is not displayed' );
					} );
				} );

				test.it( 'Can select the first design type', function() {
					this.designTypeChoicePage.selectFirstDesignType();
				} );

				test.describe( 'Step Three: Themes', function() {
					test.it( 'Can see the choose a theme page', function() {
						this.chooseAThemePage = new ChooseAThemePage( driver );
						return this.chooseAThemePage.displayed().then( ( displayed ) => {
							return assert.equal( displayed, true, 'The choose a theme start page is not displayed' );
						} );
					} );

					test.it( 'Can select the first theme', function() {
						this.chooseAThemePage.selectFirstTheme();
					} );

					test.describe( 'Step Four: Domains', function() {
						test.it( 'Can then see the domains page ', function() {
							this.findADomainComponent = new FindADomainComponent( driver );
							return this.findADomainComponent.displayed().then( ( displayed ) => {
								return assert.equal( displayed, true, 'The choose a domain page is not displayed' );
							} );
						} );

						test.it( 'Can search for a blog name, can see and select a free .wordpress address in the results', function() {
							this.findADomainComponent.searchForBlogNameAndWaitForResults( blogName );
							this.findADomainComponent.checkAndRetryForFreeBlogAddresses( expectedBlogAddresses, blogName );
							this.findADomainComponent.freeBlogAddress().then( ( actualAddress ) => {
								assert( expectedBlogAddresses.indexOf( actualAddress ) > -1, `The displayed free blog address: '${actualAddress}' was not the expected addresses: '${expectedBlogAddresses}'` );
								newBlogAddress = actualAddress;
							} );
							return this.findADomainComponent.selectFreeAddress();
						} );

						test.describe( 'Step Five: Plans', function() {
							test.it( 'Can then see the plans page', function() {
								this.pickAPlanPage = new PickAPlanPage( driver );
								return this.pickAPlanPage.displayed().then( ( displayed ) => {
									return assert.equal( displayed, true, 'The pick a plan page is not displayed' );
								} );
							} );

							test.it( 'Can select the free plan', function() {
								return this.pickAPlanPage.selectFreePlan();
							} );

							test.describe( 'Step Six: Account', function() {
								test.it( 'Can then see the account page', function() {
									this.createYourAccountPage = new CreateYourAccountPage( driver );
									return this.createYourAccountPage.displayed().then( ( displayed ) => {
										return assert.equal( displayed, true, 'The create account page is not displayed' );
									} );
								} );

								test.it( 'Can then enter account details', function() {
									return this.createYourAccountPage.enterAccountDetailsAndSubmit( emailAddress, blogName, password );
								} );

								test.describe( 'Step Seven: Sign Up Processing', function() {
									test.it( 'Can then see the sign up processing page', function() {
										this.signupProcessingPage = new SignupProcessingPage( driver );
										return this.signupProcessingPage.displayed().then( ( displayed ) => {
											return assert.equal( displayed, true, 'The sign up processing page is not displayed' );
										} );
									} );

									test.it( 'The sign up processing page will finish and show a \'Continue\' button', function() {
										this.signupProcessingPage.waitForContinueButtonToBeEnabled();
									} );

									test.it( 'Clicking the \'Continue\' button continues the process', function() {
										this.signupProcessingPage.continueAlong();
									} );

									test.describe( 'Step Eight: View Site/Trampoline', function() {
										test.it( 'We are on the view blog page, can see trampoline, our URL and title', function() {
											return this.viewBlogPage = new ViewBlogPage( driver );
										} );

										test.it( 'Can see the trampoline welcome message displayed', function() {
											this.viewBlogPage.waitForTrampolineWelcomeMessage();
											return this.viewBlogPage.isTrampolineWelcomeDisplayed().then( ( displayed ) => {
												return assert.equal( displayed, true, 'The trampoline welcome message is not displayed' );
											} );
										} );

										test.it( 'Can see the correct blog URL displayed', function() {
											return this.viewBlogPage.urlDisplayed().then( ( url ) => {
												return assert.equal( url, 'https://' + newBlogAddress + '/', 'The displayed URL on the view blog page is not as expected' );
											} );
										} );

										test.it( 'Can see the correct blog title displayed', function() {
											return this.viewBlogPage.title().then( ( title ) => {
												return assert.equal( title, 'Site Title', 'The expected blog title is not displaying correctly' );
											} );
										} );

										test.describe( 'Step Nine: Can activate my account from an email', function() {
											test.before( function() {
												return this.emailClient = new EmailClient( signupInboxId );
											} );

											test.it( 'Can see a single activation message', function() {
												return this.emailClient.pollEmailsByRecipient( emailAddress ).then( function( emails ) {
													return assert.equal( emails.length, 1, 'The number of invite emails is not equal to 1' );
												} );
											} );
										} );
									} );
								} );
							} );
						} );
					} );
				} );
			} );
		} );
	} );
} );
