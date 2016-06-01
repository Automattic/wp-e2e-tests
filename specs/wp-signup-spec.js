import test from 'selenium-webdriver/testing';
import config from 'config';
import assert from 'assert';

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
import CheckOutPage from '../lib/pages/signup/checkout-page.js';
import CheckOutThankyouPage from '../lib/pages/signup/checkout-thankyou-page.js';
import ViewBlogPage from '../lib/pages/signup/view-blog-page.js';

import FindADomainComponent from '../lib/components/find-a-domain-component.js';
import SecurePaymentComponent from '../lib/components/secure-payment-component.js';

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
	testDescribe = test.xdescribe;
}

testDescribe( 'Sign Up (' + screenSize + ')', function() {
	this.timeout( mochaTimeOut );

	test.describe( 'Sign up for a free site', function() {
		this.bailSuite( true );

		const blogName = 'e2e' + new Date().getTime().toString();
		const emailName = new Date().getTime().toString();
		const expectedBlogAddress = blogName + '.wordpress.com';

		const emailAddress = dataHelper.getEmailAddress( emailName, signupInboxId );
		const password = config.get( 'passwordForNewTestSignUps' );

		test.it( 'Ensure we are not logged in as anyone', function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.describe( 'Step One: Survey', function() {
			test.it( 'When we visit the start URL we see the survey page', function() {
				this.startPage = new StartPage( driver, { visit: true } );
				this.surveyPage = new SurveyPage( driver );
				return this.surveyPage.displayed().then( ( displayed ) => {
					return assert.equal( displayed, true, 'The survey starting page is not displayed' );
				} );
			} );

			test.it( 'Can select the first survey option', function() {
				this.surveyPage.selectFirstSurveyOptions();
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
							this.findADomainComponent.freeBlogAddress().then( ( actualAddress ) => {
								assert.equal( actualAddress, expectedBlogAddress, 'The expected free address is not shown' )
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

								test.describe( 'Step Seven: Processing', function() {
									test.it( 'Can then see the account processing page', function() {
										this.signupProcessingPage = new SignupProcessingPage( driver );
										return this.signupProcessingPage.displayed().then( ( displayed ) => {
											return assert.equal( displayed, true, 'The sign up processing page is not displayed' );
										} );
									} );

									test.it( 'The processing page will automatically disapear when finished', function() {
										this.signupProcessingPage = new SignupProcessingPage( driver );
										return this.signupProcessingPage.waitForPageToDisappear();
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
												return assert.equal( url, 'https://' + expectedBlogAddress + '/', 'The displayed URL on the view blog page is not as expected' );
											} );
										} );

										test.it( 'Can see the correct blog title displayed', function() {
											return this.viewBlogPage.title().then( ( title ) => {
												return assert( title.match( blogName ), 'The expected blog title is not displaying correctly' );
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

	test.describe( 'Partially Sign up for a site with a paid domain name', function() {
		this.bailSuite( true );

		const blogName = 'e2e' + new Date().getTime().toString();
		const emailName = new Date().getTime().toString();
		const expectedDomainName = blogName + '.com';
		const emailAddress = dataHelper.getEmailAddress( emailName, signupInboxId );
		const password = config.get( 'passwordForNewTestSignUps' );
		const sandboxCookieValue = config.get( 'storeSandboxCookieValue' );
		const firstName = 'End to End';
		const lastName = 'Testing';
		const phoneNumber = '+0422888888';
		const countryCode = 'AU';
		const address = '888 Queen Street';
		const city = 'Brisbane';
		const stateCode = 'QLD';
		const postalCode = '4000';
		const testCardHolder = 'End To End Testing';
		const testVisaNumber = '4483910254901646';
		const testVisaExpiry = '02/19';
		const testCVV = '300';
		const testCardCountryCode = 'AU';
		const testCardPostCode = '4000';

		test.it( 'Ensure we are not logged in as anyone', function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'We can set the sandbox cookie for payments', function() {
			this.WPHomePage = new WPHomePage( driver, { visit: true } );
			this.WPHomePage.setSandboxModeForPayments( sandboxCookieValue );
		} );

		test.describe( 'Step One: Survey', function() {
			test.it( 'When we visit the start URL we see the survey page', function() {
				this.startPage = new StartPage( driver, { visit: true } );
				this.surveyPage = new SurveyPage( driver );
				return this.surveyPage.displayed().then( ( displayed ) => {
					return assert.equal( displayed, true, 'The survey starting page is not displayed' );
				} );
			} );

			test.it( 'Can select the first survey option', function() {
				this.surveyPage.selectFirstSurveyOptions();
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

						test.it( 'Can search for a blog name, can see and select a custom .com domain name from the results and decline Google Apps', function() {
							this.findADomainComponent.searchForBlogNameAndWaitForResults( blogName );
							this.findADomainComponent.selectDotComAddress( expectedDomainName );
							this.findADomainComponent.waitForGoogleApps();
							return this.findADomainComponent.declineGoogleApps();
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

								test.describe( 'Step Seven: Processing', function() {
									test.it( 'Can then see the account processing page', function() {
										this.signupProcessingPage = new SignupProcessingPage( driver );
										return this.signupProcessingPage.displayed().then( ( displayed ) => {
											return assert.equal( displayed, true, 'The sign up processing page is not displayed' );
										} );
									} );

									test.it( 'The processing page will automatically disapear when finished', function() {
										return this.signupProcessingPage.waitForPageToDisappear();
									} );

									test.describe( 'Step Eight: Check Out Page', function() {
										test.it( 'Can then see the check out page', function() {
											this.checkOutPage = new CheckOutPage( driver );
											return this.checkOutPage.displayed().then( ( displayed ) => {
												return assert.equal( displayed, true, 'The check out page is not displayed' );
											} );
										} );

										test.it( 'Can enter domain registrar details and add privacy protection', function() {
											this.checkOutPage.enterRegistarDetails( firstName, lastName, emailAddress, phoneNumber, countryCode, address, city, stateCode, postalCode );
											return this.checkOutPage.selectAddPrivacyProtection();
										} );

										test.describe( 'Step Nine: Secure Payment Page', function() {
											test.it( 'Can then see the secure payment page', function() {
												this.securePaymentComponent = new SecurePaymentComponent( driver );
												return this.securePaymentComponent.displayed().then( ( displayed ) => {
													return assert.equal( displayed, true, 'The secure payment page is not displayed' );
												} );
											} );

											test.it( 'Can enter test payment details', function() {
												return this.securePaymentComponent.enterTestCreditCardDetails( testCardHolder, testVisaNumber, testVisaExpiry, testCVV, testCardCountryCode, testCardPostCode );
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

	test.describe( 'Sign up for a site on a premium paid plan', function() {
		this.bailSuite( true );

		const blogName = 'e2e' + new Date().getTime().toString();
		const emailName = new Date().getTime().toString();
		const expectedBlogAddress = `${blogName}.wordpress.com`;
		const emailAddress = dataHelper.getEmailAddress( emailName, signupInboxId );
		const password = config.get( 'passwordForNewTestSignUps' );
		const sandboxCookieValue = config.get( 'storeSandboxCookieValue' );
		const testCardHolder = 'End To End Testing';
		const testVisaNumber = '4483910254901646';
		const testVisaExpiry = '02/19';
		const testCVV = '300';
		const testCardCountryCode = 'AU';
		const testCardPostCode = '4000';

		test.it( 'Ensure we are not logged in as anyone', function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'We can set the sandbox cookie for payments', function() {
			this.WPHomePage = new WPHomePage( driver, { visit: true } );
			this.WPHomePage.setSandboxModeForPayments( sandboxCookieValue );
		} );

		test.describe( 'Step One: Survey', function() {
			test.it( 'When we visit the start URL we see the survey page', function() {
				this.startPage = new StartPage( driver, { visit: true } );
				this.surveyPage = new SurveyPage( driver );
				return this.surveyPage.displayed().then( ( displayed ) => {
					return assert.equal( displayed, true, 'The survey starting page is not displayed' );
				} );
			} );

			test.it( 'Can select the first survey option', function() {
				this.surveyPage.selectFirstSurveyOptions();
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

						test.it( 'Can search for a blog name, can see and select a free WordPress.com blog address in results', function() {
							this.findADomainComponent.searchForBlogNameAndWaitForResults( blogName );
							this.findADomainComponent.freeBlogAddress().then( ( actualAddress ) => {
								assert.equal( actualAddress, expectedBlogAddress, 'The expected free address is not shown' )
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

							test.it( 'Can select the premium plan', function() {
								return this.pickAPlanPage.selectPremiumPlan();
							} );

							test.describe( 'Step Six: Account', function() {
								test.it( 'Can then enter account details', function() {
									this.createYourAccountPage = new CreateYourAccountPage( driver );
									this.createYourAccountPage.displayed().then( ( displayed ) => {
										assert.equal( displayed, true, 'The create account page is not displayed' );
									} );
									return this.createYourAccountPage.enterAccountDetailsAndSubmit( emailAddress, blogName, password );
								} );

								test.describe( 'Step Seven: Processing', function() {
									test.it( 'Can then see the account processing page', function() {
										this.signupProcessingPage = new SignupProcessingPage( driver );
										return this.signupProcessingPage.displayed().then( ( displayed ) => {
											return assert.equal( displayed, true, 'The sign up processing page is not displayed' );
										} );
									} );

									test.it( 'The processing page will automatically disapear when finished', function() {
										return this.signupProcessingPage.waitForPageToDisappear();
									} );

									test.describe( 'Step Eight: Secure Payment Page', function() {
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

										test.describe( 'Step Nine: Checkout Thank You Page', function() {
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
	} );
} );
