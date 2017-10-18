import test from 'selenium-webdriver/testing';
import webdriver from 'selenium-webdriver';
import config from 'config';
import assert from 'assert';

import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper.js';
import * as driverHelper from '../lib/driver-helper.js';

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
import EditorPage from '../lib/pages/editor-page.js';

import FindADomainComponent from '../lib/components/find-a-domain-component.js';
import SecurePaymentComponent from '../lib/components/secure-payment-component.js';
import PostEditorToolbarComponent from '../lib/components/post-editor-toolbar-component.js';

import * as SlackNotifier from '../lib/slack-notifier';

import EmailClient from '../lib/email-client.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const signupInboxId = config.get( 'signupInboxId' );
const host = dataHelper.getJetpackHost();
const locale = driverManager.currentLocale();
const calypsoBaseURL = config.get( 'calypsoBaseURL' );

var driver;
var until = webdriver.until;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

// Faked out test.describe function to enable dynamic skipping of e-mail tests
let testDescribe = test.describe;
if ( process.env.DISABLE_EMAIL === 'true' ) {
	testDescribe = test.xdescribe;
}

testDescribe( `[${host}] Sign Up  (${screenSize}, ${locale})`, function() {
	this.timeout( mochaTimeOut );

	test.describe( 'Sign up for a free site @parallel', function() {
		this.bailSuite( true );
		let stepNum = 1;

		const blogName = dataHelper.getNewBlogName();
		let newBlogAddress = '';
		const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
		const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );
		const password = config.get( 'passwordForNewTestSignUps' );

		test.it( 'Ensure we are not logged in as anyone', function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.describe( `Step ${stepNum}: Design Type Choice`, function() {
			stepNum++;

			test.it( 'Can see the design type choice page', function() {
				this.startPage = new StartPage( driver, { visit: true, culture: locale } );
				this.designTypeChoicePage = new DesignTypeChoicePage( driver );
				return this.designTypeChoicePage.displayed().then( ( displayed ) => {
					return assert.equal( displayed, true, 'The design type choice page is not displayed' );
				} );
			} );

			test.it( 'Can select the first design type', function() {
				this.designTypeChoicePage.selectFirstDesignType();
			} );

			test.describe( `Step ${stepNum}: Themes`, function() {
				stepNum++;

				test.it( 'Can see the choose a theme page', function() {
					this.chooseAThemePage = new ChooseAThemePage( driver );
					return this.chooseAThemePage.displayed().then( ( displayed ) => {
						return assert.equal( displayed, true, 'The choose a theme start page is not displayed' );
					} );
				} );

				test.it( 'Can select the first theme', function() {
					this.chooseAThemePage.selectFirstTheme();
				} );

				test.describe( `Step ${stepNum}: Domains`, function() {
					stepNum++;

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

					test.describe( `Step ${stepNum}: Plans`, function() {
						stepNum++;

						test.it( 'Can then see the plans page', function() {
							this.pickAPlanPage = new PickAPlanPage( driver );
							return this.pickAPlanPage.displayed().then( ( displayed ) => {
								return assert.equal( displayed, true, 'The pick a plan page is not displayed' );
							} );
						} );

						test.it( 'Can select the free plan', function() {
							return this.pickAPlanPage.selectFreePlan();
						} );

						test.describe( `Step ${stepNum}: Account`, function() {
							stepNum++;

							test.it( 'Can then see the account page', function() {
								this.createYourAccountPage = new CreateYourAccountPage( driver );
								return this.createYourAccountPage.displayed().then( ( displayed ) => {
									return assert.equal( displayed, true, 'The create account page is not displayed' );
								} );
							} );

							test.it( 'Can then enter account details', function() {
								return this.createYourAccountPage.enterAccountDetailsAndSubmit( emailAddress, blogName, password );
							} );

							test.describe( `Step ${stepNum}: Sign Up Processing`, function() {
								stepNum++;

								test.it( 'Can then see the sign up processing page', function() {
									this.signupProcessingPage = new SignupProcessingPage( driver );
									return this.signupProcessingPage.displayed().then( ( displayed ) => {
										return assert.equal( displayed, true, 'The sign up processing page is not displayed' );
									} );
								} );

								test.it( 'The sign up processing page will finish and show a \'Continue\' button', function() {
									return this.signupProcessingPage.waitForContinueButtonToBeEnabled();
								} );

								test.it( 'Clicking the \'Continue\' button continues the process', function() {
									return this.signupProcessingPage.continueAlong();
								} );

								test.describe( `Step ${stepNum}: View Site/Trampoline`, function() {
									stepNum++;

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

									if ( locale === 'en' ) {
										test.it( 'Can see the correct blog title displayed', function() {
											return this.viewBlogPage.title().then( ( title ) => {
												return assert.equal( title, 'Site Title', 'The expected blog title is not displaying correctly' );
											} );
										} );
									}
								} );
							} );
						} );
					} );
				} );
			} );
		} );
	} );

	test.describe( 'Sign up for a site on a premium paid plan through main flow @parallel @canary', function() {
		this.bailSuite( true );
		let stepNum = 1;

		const blogName = dataHelper.getNewBlogName();
		const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
		let selectedBlogAddress = '';
		const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );
		const password = config.get( 'passwordForNewTestSignUps' );
		const sandboxCookieValue = config.get( 'storeSandboxCookieValue' );
		const testCreditCardDetails = dataHelper.getTestCreditCardDetails();

		test.it( 'Ensure we are not logged in as anyone', function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'We can set the sandbox cookie for payments', function() {
			this.WPHomePage = new WPHomePage( driver, { visit: true, culture: locale } );
			return this.WPHomePage.setSandboxModeForPayments( sandboxCookieValue );
		} );

		test.describe( `Step ${stepNum}: Design Type Choice`, function() {
			stepNum++;

			test.it( 'Can see the design type choice page', function() {
				this.startPage = new StartPage( driver, { visit: true, culture: locale } );
				this.designTypeChoicePage = new DesignTypeChoicePage( driver );
				driver.getCurrentUrl().then( ( u ) => {
					SlackNotifier.warn( 'Debug URL:::' + u );
				} );
				return this.designTypeChoicePage.displayed().then( ( displayed ) => {
					return assert.equal( displayed, true, 'The design type choice page is not displayed' );
				} );
			} );

			test.it( 'Can select the first design type', function() {
				return this.designTypeChoicePage.selectFirstDesignType();
			} );

			test.describe( `Step ${stepNum}: Themes`, function() {
				stepNum++;

				test.it( 'Can see the choose a theme page as the starting page', function() {
					this.chooseAThemePage = new ChooseAThemePage( driver );
					return this.chooseAThemePage.displayed().then( ( displayed ) => {
						return assert.equal( displayed, true, 'The choose a theme start page is not displayed' );
					} );
				} );

				test.it( 'Can select the first theme', function() {
					return this.chooseAThemePage.selectFirstTheme();
				} );

				test.describe( `Step ${stepNum}: Domains`, function() {
					stepNum++;

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
							selectedBlogAddress = actualAddress;
						} );

						return this.findADomainComponent.selectFreeAddress();
					} );

					test.it( 'Verify OAuth error not present', function() {
						const self = this;
						return driverHelper.getErrorMessageIfPresent( driver ).then( ( errorMsg ) => {
							if ( errorMsg !== undefined ) {
								SlackNotifier.warn( `WARNING: Error message [${errorMsg}] encountered on Find Domain page!` );
								return self.findADomainComponent.selectFreeAddress();
							}
						} );
					} );

					test.describe( `Step ${stepNum}: Plans`, function() {
						stepNum++;

						test.it( 'Can then see the plans page', function() {
							this.pickAPlanPage = new PickAPlanPage( driver );
							return this.pickAPlanPage.displayed().then( ( displayed ) => {
								return assert.equal( displayed, true, 'The pick a plan page is not displayed' );
							} );
						} );

						test.it( 'Can select the premium plan', function() {
							return this.pickAPlanPage.selectPremiumPlan();
						} );

						test.describe( `Step ${stepNum}: Account`, function() {
							stepNum++;

							test.it( 'Can then enter account details', function() {
								this.createYourAccountPage = new CreateYourAccountPage( driver );
								this.createYourAccountPage.displayed().then( ( displayed ) => {
									assert.equal( displayed, true, 'The create account page is not displayed' );
								} );
								return this.createYourAccountPage.enterAccountDetailsAndSubmit( emailAddress, blogName, password );
							} );

							test.describe( `Step ${stepNum}: Processing`, function() {
								stepNum++;

								test.it( 'Can then see the sign up processing page which will automatically move along', function() {
									this.signupProcessingPage = new SignupProcessingPage( driver );
									return this.signupProcessingPage.waitToDisappear();
								} );

								test.it( 'Verify login screen not present', () => {
									return driver.getCurrentUrl().then( ( url ) => {
										if ( ! url.match( /checkout/ ) ) {
											let baseURL = config.get( 'calypsoBaseURL' );
											let newUrl = `${baseURL}/checkout/${selectedBlogAddress}`;
											SlackNotifier.warn( `WARNING: Signup process sent me to ${url} instead of ${newUrl}` );
											return driver.get( decodeURIComponent( newUrl ) );
										}

										return true;
									} );
								} );

								test.describe( `Step ${stepNum}: Secure Payment Page`, function() {
									stepNum++;

									test.it( 'Can then see the secure payment page', function() {
										this.securePaymentComponent = new SecurePaymentComponent( driver );
										return this.securePaymentComponent.displayed().then( ( displayed ) => {
											return assert.equal( displayed, true, 'The secure payment page is not displayed' );
										} );
									} );

									test.it( 'Can enter and submit test payment details', function() {
										this.securePaymentComponent.enterTestCreditCardDetails( testCreditCardDetails );
										this.securePaymentComponent.submitPaymentDetails();
										return this.securePaymentComponent.waitForPageToDisappear();
									} );

									test.describe( `Step ${stepNum}: Checkout Thank You Page`, function() {
										stepNum++;

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

	test.describe( 'Sign up for a site on a premium paid plan coming in via /create as premium flow @parallel', function() {
		this.bailSuite( true );
		let stepNum = 1;

		const blogName = dataHelper.getNewBlogName();
		const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
		const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );
		const password = config.get( 'passwordForNewTestSignUps' );
		const sandboxCookieValue = config.get( 'storeSandboxCookieValue' );
		const testCreditCardDetails = dataHelper.getTestCreditCardDetails();

		test.it( 'Ensure we are not logged in as anyone', function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'We can set the sandbox cookie for payments', function() {
			this.WPHomePage = new WPHomePage( driver, { visit: true, culture: locale } );
			return this.WPHomePage.setSandboxModeForPayments( sandboxCookieValue );
		} );

		test.describe( `Step ${stepNum}: Design Type Choice`, function() {
			stepNum++;

			test.it( 'Can see the design type choice page', function() {
				this.startPage = new StartPage( driver, { visit: true, culture: locale, flow: 'premium' } );
				this.designTypeChoicePage = new DesignTypeChoicePage( driver );
				return this.designTypeChoicePage.displayed().then( ( displayed ) => {
					return assert.equal( displayed, true, 'The design type choice page is not displayed' );
				} );
			} );

			test.it( 'Can select the first design type', function() {
				return this.designTypeChoicePage.selectFirstDesignType();
			} );

			test.describe( `Step ${stepNum}: Themes`, function() {
				stepNum++;

				test.it( 'Can see the choose a theme page as the starting page', function() {
					this.chooseAThemePage = new ChooseAThemePage( driver );
					return this.chooseAThemePage.displayed().then( ( displayed ) => {
						return assert.equal( displayed, true, 'The choose a theme start page is not displayed' );
					} );
				} );

				test.it( 'Can select the first theme', function() {
					return this.chooseAThemePage.selectFirstTheme();
				} );

				test.describe( `Step ${stepNum}: Domains`, function() {
					stepNum++;

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

					test.describe( `Step ${stepNum}: Account`, function() {
						stepNum++;

						test.it( 'Can then enter account details', function() {
							this.createYourAccountPage = new CreateYourAccountPage( driver );
							this.createYourAccountPage.displayed().then( ( displayed ) => {
								assert.equal( displayed, true, 'The create account page is not displayed' );
							} );
							return this.createYourAccountPage.enterAccountDetailsAndSubmit( emailAddress, blogName, password );
						} );

						test.describe( `Step ${stepNum}: Processing`, function() {
							stepNum++;

							test.it( 'Can then see the sign up processing page', function() {
								this.signupProcessingPage = new SignupProcessingPage( driver );
								return this.signupProcessingPage.displayed().then( ( displayed ) => {
									return assert.equal( displayed, true, 'The sign up processing page is not displayed' );
								} );
							} );

							test.it( 'The sign up processing page will finish and show a \'Continue\' button', function() {
								return this.signupProcessingPage.waitForContinueButtonToBeEnabled();
							} );

							test.it( 'Clicking the \'Continue\' button continues the process', function() {
								return this.signupProcessingPage.continueAlong();
							} );

							test.describe( `Step ${stepNum}: Secure Payment Page`, function() {
								stepNum++;

								test.it( 'Can then see the secure payment page', function() {
									this.securePaymentComponent = new SecurePaymentComponent( driver );
									return this.securePaymentComponent.displayed().then( ( displayed ) => {
										return assert.equal( displayed, true, 'The secure payment page is not displayed' );
									} );
								} );

								test.it( 'Can enter and submit test payment details', function() {
									this.securePaymentComponent.enterTestCreditCardDetails( testCreditCardDetails );
									this.securePaymentComponent.submitPaymentDetails();
									return this.securePaymentComponent.waitForPageToDisappear();
								} );

								test.describe( `Step ${stepNum}: Checkout Thank You Page`, function() {
									stepNum++;

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

	test.describe( 'Partially sign up for a site on a business paid plan w/ domain name coming in via /create as business flow @parallel @canary', function() {
		this.bailSuite( true );
		let stepNum = 1;

		const siteName = dataHelper.getNewBlogName();
		const expectedDomainName = `${siteName}.com`;
		const emailAddress = dataHelper.getEmailAddress( siteName, signupInboxId );
		const password = config.get( 'passwordForNewTestSignUps' );
		const sandboxCookieValue = config.get( 'storeSandboxCookieValue' );
		const testCreditCardDetails = dataHelper.getTestCreditCardDetails();
		const firstName = 'End to End';
		const lastName = 'Testing';
		const phoneNumber = '0422 888 888';
		const countryCode = 'AU';
		const address = '888 Queen Street';
		const city = 'Brisbane';
		const stateCode = 'QLD';
		const postalCode = '4000';

		test.it( 'Ensure we are not logged in as anyone', function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'We can set the sandbox cookie for payments', function() {
			this.WPHomePage = new WPHomePage( driver, { visit: true, culture: locale } );
			this.WPHomePage.setSandboxModeForPayments( sandboxCookieValue );
		} );

		test.describe( `Step ${stepNum}: Design Type Choice`, function() {
			stepNum++;

			test.it( 'Can see the design type choice page', function() {
				this.startPage = new StartPage( driver, { visit: true, culture: locale, flow: 'business' } );

				this.designTypeChoicePage = new DesignTypeChoicePage( driver );
				return this.designTypeChoicePage.displayed().then( ( displayed ) => {
					return assert.equal( displayed, true, 'The design type choice page is not displayed' );
				} );
			} );

			test.it( 'Can select the first design type', function() {
				this.designTypeChoicePage.selectFirstDesignType();
			} );

			test.describe( `Step ${stepNum}: Themes`, function() {
				stepNum++;

				test.it( 'Can see the choose a theme page as the starting page', function() {
					this.chooseAThemePage = new ChooseAThemePage( driver );
					return this.chooseAThemePage.displayed().then( ( displayed ) => {
						return assert.equal( displayed, true, 'The choose a theme start page is not displayed' );
					} );
				} );

				test.it( 'Can select the first theme', function() {
					return this.chooseAThemePage.selectFirstTheme();
				} );

				test.describe( `Step ${stepNum}: Domains`, function() {
					stepNum++;

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

					test.it( 'Verify OAuth error not present', function() {
						const self = this;
						return driverHelper.getErrorMessageIfPresent( driver ).then( ( errorMsg ) => {
							if ( errorMsg !== undefined ) {
								SlackNotifier.warn( `WARNING: Error message [${errorMsg}] encountered on Find Domain page!` );
								return self.findADomainComponent.selectDotComAddress( expectedDomainName );
							}
						} );
					} );

					test.describe( `Step ${stepNum}: Account`, function() {
						stepNum++;

						test.it( 'Can then enter account details', function() {
							this.createYourAccountPage = new CreateYourAccountPage( driver );
							this.createYourAccountPage.displayed().then( ( displayed ) => {
								assert.equal( displayed, true, 'The create account page is not displayed' );
							} );
							return this.createYourAccountPage.enterAccountDetailsAndSubmit( emailAddress, siteName, password );
						} );

						test.describe( `Step ${stepNum}: Processing`, function() {
							stepNum++;

							test.it( 'Can then see the sign up processing page which will finish automatically move along', function() {
								this.signupProcessingPage = new SignupProcessingPage( driver );
								return this.signupProcessingPage.waitToDisappear();
							} );

							test.it( 'Verify login screen not present', () => {
								return driver.getCurrentUrl().then( ( url ) => {
									if ( ! url.match( /checkout/ ) ) {
										let baseURL = config.get( 'calypsoBaseURL' );
										let newUrl = `${baseURL}/checkout/${expectedDomainName}/business`;
										SlackNotifier.warn( `WARNING: Signup process sent me to ${url} instead of ${newUrl}!` );
										return driver.get( decodeURIComponent( newUrl ) );
									}

									return true;
								} );
							} );

							test.describe( `Step ${stepNum}: Secure Payment Page`, function() {
								stepNum++;

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
									return this.securePaymentComponent.enterTestCreditCardDetails( testCreditCardDetails );
								} );
							} );
						} );
					} );
				} );
			} );
		} );
	} );

	test.describe( 'Sign up for a Survey Step free site @parallel', function() {
		this.bailSuite( true );
		let stepNum = 1;

		const blogName = dataHelper.getNewBlogName();
		let newBlogAddress = '';
		const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
		const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );
		const password = config.get( 'passwordForNewTestSignUps' );
		let inboxEmails = null;

		test.it( 'Ensure we are not logged in as anyone', function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.describe( `Step ${stepNum}: Survey`, function() {
			stepNum++;

			test.it( 'When we visit the start URL we see the survey page', function() {
				this.startPage = new StartPage( driver, { visit: true, culture: locale, flow: 'surveystep' } );
				this.surveyPage = new SurveyPage( driver );
				return this.surveyPage.displayed().then( ( displayed ) => {
					return assert.equal( displayed, true, 'The survey starting page is not displayed' );
				} );
			} );

			test.it( 'Can select the first survey option', function() {
				return this.surveyPage.selectOtherSurveyOption( 'e2e Automated Testing' );
			} );

			test.describe( `Step ${stepNum}: Design Type Choice`, function() {
				stepNum++;

				test.it( 'Can see the design type choice page', function() {
					this.designTypeChoicePage = new DesignTypeChoicePage( driver );
					return this.designTypeChoicePage.displayed().then( ( displayed ) => {
						return assert.equal( displayed, true, 'The design type choice page is not displayed' );
					} );
				} );

				test.it( 'Can select the first design type', function() {
					return this.designTypeChoicePage.selectFirstDesignType();
				} );

				test.describe( `Step ${stepNum}: Themes`, function() {
					stepNum++;

					test.it( 'Can see the choose a theme page', function() {
						this.chooseAThemePage = new ChooseAThemePage( driver );
						return this.chooseAThemePage.displayed().then( ( displayed ) => {
							return assert.equal( displayed, true, 'The choose a theme start page is not displayed' );
						} );
					} );

					test.it( 'Can select the first theme', function() {
						return this.chooseAThemePage.selectFirstTheme();
					} );

					test.describe( `Step ${stepNum}: Domains`, function() {
						stepNum++;

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

						test.describe( `Step ${stepNum}: Plans`, function() {
							stepNum++;

							test.it( 'Can then see the plans page', function() {
								this.pickAPlanPage = new PickAPlanPage( driver );
								return this.pickAPlanPage.displayed().then( ( displayed ) => {
									return assert.equal( displayed, true, 'The pick a plan page is not displayed' );
								} );
							} );

							test.it( 'Can select the free plan', function() {
								return this.pickAPlanPage.selectFreePlan();
							} );

							test.describe( `Step ${stepNum}: Account`, function() {
								stepNum++;

								test.it( 'Can then see the account page', function() {
									this.createYourAccountPage = new CreateYourAccountPage( driver );
									return this.createYourAccountPage.displayed().then( ( displayed ) => {
										return assert.equal( displayed, true, 'The create account page is not displayed' );
									} );
								} );

								test.it( 'Can then enter account details', function() {
									return this.createYourAccountPage.enterAccountDetailsAndSubmit( emailAddress, blogName, password );
								} );

								test.describe( `Step ${stepNum}: Sign Up Processing`, function() {
									stepNum++;

									test.it( 'Can then see the sign up processing page', function() {
										this.signupProcessingPage = new SignupProcessingPage( driver );
										return this.signupProcessingPage.displayed().then( ( displayed ) => {
											return assert.equal( displayed, true, 'The sign up processing page is not displayed' );
										} );
									} );

									test.it( 'The sign up processing page will finish and show a \'Continue\' button', function() {
										return this.signupProcessingPage.waitForContinueButtonToBeEnabled();
									} );

									test.it( 'Clicking the \'Continue\' button continues the process', function() {
										return this.signupProcessingPage.continueAlong();
									} );

									test.describe( `Step ${stepNum}: View Site/Trampoline`, function() {
										stepNum++;

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

										if ( locale === 'en' ) {
											test.it( 'Can see the correct blog title displayed', function() {
												return this.viewBlogPage.title().then( ( title ) => {
													return assert.equal( title, 'Site Title', 'The expected blog title is not displaying correctly' );
												} );
											} );
										}

										test.describe( `Step ${stepNum}: Can not publish until email is confirmed`, function() {
											stepNum++;

											test.it( 'Can see a disabled publish button', function() {
												const blogPostTitle = dataHelper.randomPhrase();
												const blogPostQuote = dataHelper.randomPhrase();
												driver.get( calypsoBaseURL + '/post/' + newBlogAddress );

												this.editor = new EditorPage( driver );
												this.editor.enterTitle( blogPostTitle );
												this.editor.enterContent( blogPostQuote + '\n' );

												this.postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
												this.postEditorToolbarComponent.ensureSaved();

												return this.editor.publishEnabled().then( ( enabled ) => {
													return assert.equal( enabled, false, 'Publish button is not enabled when activation link has not been clicked' );
												} );
											} );

											test.describe( `Step ${stepNum}: Can activate my account from an email`, function() {
												stepNum++;

												test.before( function() {
													return this.emailClient = new EmailClient( signupInboxId );
												} );

												test.it( 'Can see a single activation message', function() {
													return this.emailClient.pollEmailsByRecipient( emailAddress ).then( function( emails ) {
														inboxEmails = emails;
														return assert.equal( emails.length, 1, 'The number of invite emails is not equal to 1' );
													} );
												} );

												test.describe( `Step ${stepNum}: Can publish when email is confirmed`, function() {
													stepNum++;

													test.it( 'Can not see a disabled publish button', function() {
														const blogPostTitle = dataHelper.randomPhrase();
														const blogPostQuote = dataHelper.randomPhrase();
														driver.get( inboxEmails[0].html.links[0].href );
														driver.get( calypsoBaseURL + '/post/' + newBlogAddress );

														this.editor = new EditorPage( driver );
														this.editor.enterTitle( blogPostTitle );
														this.editor.enterContent( blogPostQuote + '\n' );

														this.postEditorToolbarComponent = new PostEditorToolbarComponent( driver );
														this.postEditorToolbarComponent.ensureSaved();

														return this.editor.publishEnabled().then( ( enabled ) => {
															return assert.equal( enabled, true, 'Publish button is enabled after account activation' );
														} );
													} );

													test.it( 'Can not see email verification required message', function() {
														return this.editor.emailVerificationNoticeDisplayed().then( ( displayed ) => {
															return assert.equal( displayed, false, 'Email Verification Notice is displayed when activation link has been clicked' );
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
	} );
} );
