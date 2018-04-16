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

let driver;

let eyes = eyesHelper.eyesSetup( true );

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

// Faked out test.describe function to enable dynamic skipping of e-mail tests
let testDescribe = test.describe;
if ( process.env.DISABLE_EMAIL === 'true' ) {
	testDescribe = test.xdescribe;
}

testDescribe( `[${ host }] Sign Up  (${ screenSize }, ${ locale })`, function() {
	this.timeout( mochaTimeOut );

	test.describe(
		'Sign up for a free site and log in via a magic link @parallel @email',
		function() {
			this.bailSuite( true );
			const blogName = dataHelper.getNewBlogName();
			let newBlogAddress = '';
			const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
			const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );
			const password = config.get( 'passwordForNewTestSignUps' );
			let magicLoginLink;

			test.it( 'Ensure we are not logged in as anyone', function() {
				return driverManager.ensureNotLoggedIn( driver );
			} );

			test.it( 'Can visit the start page', function() {
				return new StartPage( driver, {
					visit: true,
					culture: locale,
				} ).displayed();
			} );

			test.it( 'Can see the "About" page, and enter some site information', function() {
				const aboutPage = new AboutPage( driver );
				aboutPage.enterSiteDetails( blogName, 'Electronics', {
					share: true,
				} );
				return aboutPage.submitForm();
			} );

			test.it(
				'Can then see the domains page, and Can search for a blog name, can see and select a free .wordpress address in the results',
				function() {
					const findADomainComponent = new FindADomainComponent( driver );
					findADomainComponent.searchForBlogNameAndWaitForResults( blogName );
					findADomainComponent.checkAndRetryForFreeBlogAddresses( expectedBlogAddresses, blogName );
					findADomainComponent.freeBlogAddress().then( actualAddress => {
						assert(
							expectedBlogAddresses.indexOf( actualAddress ) > -1,
							`The displayed free blog address: '${ actualAddress }' was not the expected addresses: '${ expectedBlogAddresses }'`
						);
						newBlogAddress = actualAddress;
					} );
					return findADomainComponent.selectFreeAddress();
				}
			);

			test.it( 'Can see the plans page and pick the free plan', function() {
				return new PickAPlanPage( driver ).selectFreePlan();
			} );

			test.it( 'Can see the account page and enter account details', function() {
				return new CreateYourAccountPage( driver ).enterAccountDetailsAndSubmit(
					emailAddress,
					blogName,
					password
				);
			} );

			test.it(
				"Can see the sign up processing page -  will finish and show a 'Continue' button which is clicked",
				function() {
					const signupProcessingPage = new SignupProcessingPage( driver );
					signupProcessingPage.waitForContinueButtonToBeEnabled();
					return signupProcessingPage.continueAlong();
				}
			);

			test.it( 'Can see expected Welcome message, URL, title, ', function() {
				const viewBlogPage = new ViewBlogPage( driver );
				viewBlogPage.waitForTrampolineWelcomeMessage();
				viewBlogPage
					.isTrampolineWelcomeDisplayed()
					.then( displayed =>
						assert.equal( displayed, true, 'The trampoline welcome message is not displayed' )
					);
				viewBlogPage
					.urlDisplayed()
					.then( url =>
						assert.equal(
							url,
							'https://' + newBlogAddress + '/',
							'The displayed URL on the view blog page is not as expected'
						)
					);
				return viewBlogPage.title().then( title => {
					if ( global.browserName === 'Internet Explorer' ) {
						assert.equal(
							title,
							'Site Title',
							'The expected blog title is not displaying correctly'
						);
					} else {
						assert.equal( title, blogName, 'The expected blog title is not displaying correctly' );
					}
				} );
			} );

			test.it( 'Can log out and request a magic link', function() {
				driverManager.clearCookiesAndDeleteLocalStorage( driver );
				return new LoginPage( driver, true ).requestMagicLink( emailAddress );
			} );

			test.it( 'Can see email containing magic link', function() {
				const emailClient = new EmailClient( signupInboxId );
				const validator = emails =>
					emails.find( email => email.subject.includes( 'WordPress.com' ) );
				return emailClient.pollEmailsByRecipient( emailAddress, validator ).then( emails => {
					//Disabled due to a/b test on activation email. See https://github.com/Automattic/wp-e2e-tests/issues/819
					//assert.equal( emails.length, 2, 'The number of newly registered emails is not equal to 2 (activation and magic link)' );
					for ( let email of emails ) {
						if ( email.subject.includes( 'WordPress.com' ) ) {
							return ( magicLoginLink = email.html.links[ 0 ].href );
						}
					}
					assert(
						magicLoginLink !== undefined,
						'Could not locate the magic login link email link'
					);
				} );
			} );

			test.it( 'Can visit the magic link and we should be logged in', function() {
				driver.get( magicLoginLink );
				new MagicLoginPage( driver ).finishLogin();
				return new ReaderPage( driver ).displayed();
			} );
		}
	);

	test.describe(
		'Sign up for a site on a premium paid plan through main flow @parallel @visdiff',
		function() {
			this.bailSuite( true );
			let stepNum = 1;

			const blogName = dataHelper.getNewBlogName();
			const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
			const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );
			const password = config.get( 'passwordForNewTestSignUps' );
			const sandboxCookieValue = config.get( 'storeSandboxCookieValue' );
			const testCreditCardDetails = dataHelper.getTestCreditCardDetails();

			test.before( function() {
				let testEnvironment = 'WordPress.com';
				let testName = `Signup [${ global.browserName }] [${ screenSize }]`;
				eyesHelper.eyesOpen( driver, eyes, testEnvironment, testName );
			} );

			test.it( 'Ensure we are not logged in as anyone', function() {
				return driverManager.ensureNotLoggedIn( driver );
			} );

			test.it( 'We can set the sandbox cookie for payments', function() {
				const wPHomePage = new WPHomePage( driver, {
					visit: true,
					culture: locale,
				} );
				eyesHelper.eyesScreenshot( driver, eyes, 'Logged Out Homepage' );
				return wPHomePage.setSandboxModeForPayments( sandboxCookieValue );
			} );

			test.describe( `Step ${ stepNum }: About Page`, function() {
				stepNum++;

				test.it( 'Can visit the start page', function() {
					return new StartPage( driver, {
						visit: true,
						culture: locale,
					} ).displayed();
				} );

				test.it( 'Can see the "About" page, and enter some site information', function() {
					const aboutPage = new AboutPage( driver );
					return aboutPage.displayed().then( displayed => {
						eyesHelper.eyesScreenshot( driver, eyes, 'About Page' );
						return assert.equal( displayed, true, 'The about page is not displayed' );
					} );
				} );

				test.it( 'Can accept defaults for about page', function() {
					const aboutPage = new AboutPage( driver );
					aboutPage.submitForm();
				} );

				test.describe( `Step ${ stepNum }: Domains`, function() {
					stepNum++;

					test.it( 'Can then see the domains page ', function() {
						const findADomainComponent = new FindADomainComponent( driver );
						const signupStepComponent = new SignupStepComponent( driver );
						signupStepComponent.waitForSignupStepLoad();
						return findADomainComponent.displayed().then( displayed => {
							eyesHelper.eyesScreenshot( driver, eyes, 'Domains Page' );
							return assert.equal( displayed, true, 'The choose a domain page is not displayed' );
						} );
					} );

					test.it(
						'Can search for a blog name, can see and select a free WordPress.com blog address in results',
						function() {
							const findADomainComponent = new FindADomainComponent( driver );
							findADomainComponent.searchForBlogNameAndWaitForResults( blogName );
							findADomainComponent.checkAndRetryForFreeBlogAddresses(
								expectedBlogAddresses,
								blogName
							);
							findADomainComponent.freeBlogAddress().then( actualAddress => {
								assert(
									expectedBlogAddresses.indexOf( actualAddress ) > -1,
									`The displayed free blog address: '${ actualAddress }' was not the expected addresses: '${ expectedBlogAddresses }'`
								);
							} );

							eyesHelper.eyesScreenshot( driver, eyes, 'Domains Page Site Address Search' );
							return findADomainComponent.selectFreeAddress();
						}
					);

					test.describe( `Step ${ stepNum }: Plans`, function() {
						stepNum++;

						test.it( 'Can then see the plans page and select the premium plan ', function() {
							const pickAPlanPage = new PickAPlanPage( driver );
							pickAPlanPage.displayed().then( displayed => {
								eyesHelper.eyesScreenshot( driver, eyes, 'Plans Page' );
								return assert.equal( displayed, true, 'The pick a plan page is not displayed' );
							} );
							return pickAPlanPage.selectPremiumPlan();
						} );

						test.describe( `Step ${ stepNum }: Account`, function() {
							stepNum++;

							test.it( 'Can then enter account details', function() {
								const createYourAccountPage = new CreateYourAccountPage( driver );
								const signupStepComponent = new SignupStepComponent( driver );
								signupStepComponent.waitForSignupStepLoad();
								eyesHelper.eyesScreenshot( driver, eyes, 'Create Account Page' );
								return createYourAccountPage.enterAccountDetailsAndSubmit(
									emailAddress,
									blogName,
									password
								);
							} );

							test.describe( `Step ${ stepNum }: Processing`, function() {
								stepNum++;

								test.it(
									'Can then see the sign up processing page which will automatically move along',
									function() {
										return new SignupProcessingPage( driver ).waitToDisappear();
									}
								);

								test.describe( `Step ${ stepNum }: Secure Payment Page`, function() {
									stepNum++;

									test.it( 'Can then see the secure payment page', function() {
										const securePaymentComponent = new SecurePaymentComponent( driver );
										return securePaymentComponent.displayed().then( displayed => {
											eyesHelper.eyesScreenshot( driver, eyes, 'Secure Payment Page' );
											return assert.equal(
												displayed,
												true,
												'The secure payment page is not displayed'
											);
										} );
									} );

									test.it( 'Can enter and submit test payment details', function() {
										const securePaymentComponent = new SecurePaymentComponent( driver );
										securePaymentComponent.enterTestCreditCardDetails( testCreditCardDetails );
										securePaymentComponent.submitPaymentDetails();
										return securePaymentComponent.waitForPageToDisappear();
									} );

									test.describe( `Step ${ stepNum }: Checkout Thank You Page`, function() {
										stepNum++;

										test.it( 'Can see the secure check out thank you page', function() {
											const checkOutThankyouPage = new CheckOutThankyouPage( driver );
											return checkOutThankyouPage.displayed().then( displayed => {
												eyesHelper.eyesScreenshot( driver, eyes, 'Checkout Thank You Page' );
												return assert.equal(
													displayed,
													true,
													'The checkout thank you page is not displayed'
												);
											} );
										} );
									} );
								} );
							} );
						} );
					} );
				} );
			} );

			test.after( function() {
				eyesHelper.eyesClose( eyes );
			} );
		}
	);

	test.describe(
		'Sign up for a site on a premium paid plan coming in via /create as premium flow @parallel',
		function() {
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
				return new WPHomePage( driver, {
					visit: true,
					culture: locale,
				} ).setSandboxModeForPayments( sandboxCookieValue );
			} );

			test.describe( `Step ${ stepNum }: About Page`, function() {
				stepNum++;

				test.it( 'Can visit the start page', function() {
					return new StartPage( driver, {
						visit: true,
						culture: locale,
						flow: 'premium',
					} ).displayed();
				} );

				test.it( 'Can see the about page and accept defaults', function() {
					return new AboutPage( driver ).submitForm();
				} );

				test.describe( `Step ${ stepNum }: Themes`, function() {
					stepNum++;

					test.it(
						'Can see the choose a theme page as the starting page, and select the first theme',
						function() {
							return new ChooseAThemePage( driver ).selectFirstTheme();
						}
					);

					test.describe( `Step ${ stepNum }: Domains`, function() {
						stepNum++;

						test.it(
							'Can then see the domains page and can search for a blog name, can see and select a free WordPress.com blog address in results',
							function() {
								const findADomainComponent = new FindADomainComponent( driver );
								findADomainComponent.searchForBlogNameAndWaitForResults( blogName );
								findADomainComponent.checkAndRetryForFreeBlogAddresses(
									expectedBlogAddresses,
									blogName
								);
								findADomainComponent.freeBlogAddress().then( actualAddress => {
									assert(
										expectedBlogAddresses.indexOf( actualAddress ) > -1,
										`The displayed free blog address: '${ actualAddress }' was not the expected addresses: '${ expectedBlogAddresses }'`
									);
								} );
								return findADomainComponent.selectFreeAddress();
							}
						);

						test.describe( `Step ${ stepNum }: Account`, function() {
							stepNum++;

							test.it( 'Can see the account details page and enter account details', function() {
								return new CreateYourAccountPage( driver ).enterAccountDetailsAndSubmit(
									emailAddress,
									blogName,
									password
								);
							} );

							test.describe( `Step ${ stepNum }: Processing`, function() {
								stepNum++;

								test.it(
									"Can then see the sign up processing page and it will finish and show a 'Continue' button, which is clicked",
									function() {
										const signupProcessingPage = new SignupProcessingPage( driver );
										signupProcessingPage.waitForContinueButtonToBeEnabled();
										return signupProcessingPage.continueAlong();
									}
								);

								test.describe( `Step ${ stepNum }: Secure Payment Page`, function() {
									stepNum++;

									test.it(
										'Can then see the secure payment page, and can enter and submit test payment details',
										function() {
											const securePaymentComponent = new SecurePaymentComponent( driver );
											securePaymentComponent.enterTestCreditCardDetails( testCreditCardDetails );
											securePaymentComponent.submitPaymentDetails();
											return securePaymentComponent.waitForPageToDisappear();
										}
									);

									test.describe( `Step ${ stepNum }: Checkout Thank You Page`, function() {
										stepNum++;

										test.it( 'Can see the secure check out thank you page', function() {
											return new CheckOutThankyouPage( driver ).displayed();
										} );
									} );
								} );
							} );
						} );
					} );
				} );
			} );
		}
	);

	test.describe(
		'Sign up for a domain only purchase coming in from wordpress.com/domains @parallel',
		function() {
			this.bailSuite( true );
			let stepNum = 1;
			const siteName = dataHelper.getNewBlogName();
			const expectedDomainName = `${ siteName }.live`;
			const emailAddress = dataHelper.getEmailAddress( siteName, signupInboxId );
			const password = config.get( 'passwordForNewTestSignUps' );
			const sandboxCookieValue = config.get( 'storeSandboxCookieValue' );
			const testCreditCardDetails = dataHelper.getTestCreditCardDetails();
			const testDomainRegistarDetails = dataHelper.getTestDomainRegistarDetails( emailAddress );

			test.it( 'Ensure we are not logged in as anyone', function() {
				return driverManager.ensureNotLoggedIn( driver );
			} );

			test.it( 'We can visit set the sandbox cookie for payments', function() {
				return new WPHomePage( driver, {
					visit: true,
					culture: locale,
				} ).setSandboxModeForPayments( sandboxCookieValue );
			} );

			test.describe( `Step ${ stepNum }: WordPress.com/domains page`, function() {
				stepNum++;

				test.it( 'Can visit the domains start page', function() {
					return new StartPage( driver, {
						visit: true,
						culture: locale,
						flow: 'domain-first',
						domainFirst: true,
						domainFirstDomain: expectedDomainName,
					} ).displayed();
				} );

				test.it( 'Can select domain only from the domain first choice page', function() {
					return new DomainFirstPage( driver ).chooseJustBuyTheDomain();
				} );

				test.describe( `Step ${ stepNum }: Account`, function() {
					stepNum++;

					test.it( 'Can then enter account details', function() {
						return new CreateYourAccountPage( driver ).enterAccountDetailsAndSubmit(
							emailAddress,
							siteName,
							password
						);
					} );

					test.describe( `Step ${ stepNum }: Processing`, function() {
						stepNum++;

						test.it(
							'Can then see the sign up processing page which will finish automatically move along',
							function() {
								return new SignupProcessingPage( driver ).waitToDisappear();
							}
						);

						test.describe( `Step ${ stepNum }: Checkout and Secure Payment Page`, function() {
							stepNum++;

							test.it(
								'Can see checkout page, choose domain privacy option and enter registrar details',
								() => {
									const checkOutPage = new CheckOutPage( driver );
									checkOutPage.selectAddPrivacyProtectionCheckbox();
									checkOutPage.enterRegistarDetails( testDomainRegistarDetails );
									return checkOutPage.submitForm();
								}
							);

							test.it(
								'Can then see the secure payment page and enter/submit test payment details',
								function() {
									const securePaymentComponent = new SecurePaymentComponent( driver );
									securePaymentComponent.enterTestCreditCardDetails( testCreditCardDetails );
									securePaymentComponent.submitPaymentDetails();
									securePaymentComponent.waitForCreditCardPaymentProcessing();
									return securePaymentComponent.waitForPageToDisappear();
								}
							);

							test.describe( `Step ${ stepNum }: Checkout Thank You Page`, function() {
								stepNum++;

								test.it(
									'Can see the secure check out thank you page and click "go to my domain" button to see the domain only settings page',
									function() {
										new CheckOutThankyouPage( driver ).goToMyDomain();
										new DomainOnlySettingsPage( driver ).manageDomain();
										return new DomainDetailsPage( driver ).displayed();
									}
								);

								test.describe( `Step ${ stepNum }: View Calypso Menus`, function() {
									stepNum++;

									// Open the sidebar
									test.before( function() {
										return new NavBarComponent( driver ).clickMySites();
									} );

									test.it( 'We should only one option - the settings option', function() {
										const sideBarComponent = new SideBarComponent( driver );
										sideBarComponent.numberOfMenuItems().then( numberMenuItems => {
											assert.equal(
												numberMenuItems,
												1,
												'There is not a single menu item for a domain only site'
											);
										} );
										return sideBarComponent.settingsOptionExists().then( exists => {
											assert( exists, 'The settings menu option does not exist' );
										} );
									} );

									test.describe( `Step ${ stepNum }: Cancel the domain via purchases`, function() {
										stepNum++;

										test.it( 'Cancel the domain', function() {
											try {
												new SideBarComponent( driver ).selectSettings();
												new DomainOnlySettingsPage( driver ).manageDomain();
												new DomainDetailsPage( driver ).viewPaymentSettings();

												const managePurchasePage = new ManagePurchasePage( driver );
												managePurchasePage.domainDisplayed().then( domainDisplayed => {
													assert.equal(
														domainDisplayed,
														expectedDomainName,
														'The domain displayed on the manage purchase page is unexpected'
													);
												} );
												managePurchasePage.chooseCancelAndRefund();

												new CancelPurchasePage( driver ).clickCancelPurchase();

												const cancelDomainPage = new CancelDomainPage( driver );
												return cancelDomainPage.completeSurveyAndConfirm();
											} catch ( err ) {
												SlackNotifier.warn(
													`There was an error in the hooks that clean up the test domains but since it is cleaning up we really don't care: '${ err }'`
												);
											}
										} );
									} );
								} );
							} );
						} );
					} );
				} );
			} );
		}
	);

	test.describe(
		'Sign up for a site on a business paid plan w/ domain name coming in via /create as business flow @parallel',
		function() {
			this.bailSuite( true );
			let stepNum = 1;

			const siteName = dataHelper.getNewBlogName();
			const expectedDomainName = `${ siteName }.live`;
			const emailAddress = dataHelper.getEmailAddress( siteName, signupInboxId );
			const password = config.get( 'passwordForNewTestSignUps' );
			const sandboxCookieValue = config.get( 'storeSandboxCookieValue' );
			const testCreditCardDetails = dataHelper.getTestCreditCardDetails();
			const testDomainRegistarDetails = dataHelper.getTestDomainRegistarDetails( emailAddress );

			test.it( 'Ensure we are not logged in as anyone', function() {
				return driverManager.ensureNotLoggedIn( driver );
			} );

			test.it( 'We can set the sandbox cookie for payments', function() {
				return new WPHomePage( driver, {
					visit: true,
					culture: locale,
				} ).setSandboxModeForPayments( sandboxCookieValue );
			} );

			test.describe( `Step ${ stepNum }: About Page`, function() {
				stepNum++;

				test.it( 'Can visit the start page', function() {
					return new StartPage( driver, {
						visit: true,
						culture: locale,
						flow: 'business',
					} ).displayed();
				} );

				test.it( 'Can see the about page and accept defaults', function() {
					return new AboutPage( driver ).submitForm();
				} );

				test.describe( `Step ${ stepNum }: Themes`, function() {
					stepNum++;

					test.it(
						'Can see the choose a theme page as the starting page, and select the first theme',
						function() {
							return new ChooseAThemePage( driver ).selectFirstTheme();
						}
					);

					test.describe( `Step ${ stepNum }: Domains`, function() {
						stepNum++;

						test.it(
							'Can then see the domains page, and can search for a blog name, can see and select a paid .live address in results ',
							function() {
								const findADomainComponent = new FindADomainComponent( driver );
								findADomainComponent.searchForBlogNameAndWaitForResults( expectedDomainName );
								return findADomainComponent.selectDomainAddress( expectedDomainName );
							}
						);

						test.describe( `Step ${ stepNum }: Account`, function() {
							stepNum++;

							test.it( 'Can then enter account details and continue', function() {
								return new CreateYourAccountPage( driver ).enterAccountDetailsAndSubmit(
									emailAddress,
									siteName,
									password
								);
							} );

							test.describe( `Step ${ stepNum }: Processing`, function() {
								stepNum++;

								test.it(
									'Can then see the sign up processing page which will finish automatically move along',
									function() {
										return new SignupProcessingPage( driver ).waitToDisappear();
									}
								);

								test.describe( `Step ${ stepNum }: Secure Payment Page`, function() {
									stepNum++;

									test.it(
										'Can see checkout page, choose domain privacy option and enter registrar details',
										() => {
											const checkOutPage = new CheckOutPage( driver );
											checkOutPage.selectAddPrivacyProtectionCheckbox();
											checkOutPage.enterRegistarDetails( testDomainRegistarDetails );
											return checkOutPage.submitForm();
										}
									);

									test.it(
										'Can then see the secure payment page and enter/submit test payment details',
										function() {
											const securePaymentComponent = new SecurePaymentComponent( driver );
											securePaymentComponent.enterTestCreditCardDetails( testCreditCardDetails );
											securePaymentComponent.submitPaymentDetails();
											securePaymentComponent.waitForCreditCardPaymentProcessing();
											return securePaymentComponent.waitForPageToDisappear();
										}
									);

									test.describe( `Step ${ stepNum }: GSuite Upsell Page`, function() {
										stepNum++;

										test.it( 'Can see the gsuite upsell page', function() {
											return new GSuiteUpsellPage( driver ).declineEmail();
										} );

										test.describe( `Step ${ stepNum }: Checkout Thank You Page`, function() {
											stepNum++;

											test.it( 'Can see the secure check out thank you page', function() {
												return new CheckOutThankyouPage( driver ).displayed();
											} );

											test.describe(
												`Step ${ stepNum }: Cancel the domain via purchases`,
												function() {
													stepNum++;

													test.it( 'Cancel the domain', function() {
														try {
															new NavBarComponent( driver ).clickProfileLink();
															new ProfilePage( driver ).chooseManagePurchases();

															let purchasesPage = new PurchasesPage( driver );
															purchasesPage.dismissGuidedTour();
															purchasesPage.selectBusinessPlan();

															new ManagePurchasePage( driver ).chooseCancelAndRefund();

															const cancelPurchasePage = new CancelPurchasePage( driver );
															cancelPurchasePage.chooseCancelPlanAndDomain();
															cancelPurchasePage.clickCancelPurchase();
															return cancelPurchasePage.completeCancellationSurvey();
														} catch ( err ) {
															SlackNotifier.warn(
																`There was an error in the hooks that clean up the test domains but since it is cleaning up we really don't care: '${ err }'`
															);
														}
													} );
												}
											);
										} );
									} );
								} );
							} );
						} );
					} );
				} );
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
		const password = config.get( 'passwordForNewTestSignUps' );

		test.it( 'Ensure we are not logged in as anyone', function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.describe( `Step ${ stepNum }: About Page`, function() {
			stepNum++;

			test.it( 'Can visit the start page', function() {
				return new StartPage( driver, {
					visit: true,
					culture: locale,
				} ).displayed();
			} );

			test.it( 'Can see the about page and accept defaults', function() {
				return new AboutPage( driver ).submitForm();
			} );

			test.describe( `Step ${ stepNum }: Domains`, function() {
				stepNum++;

				test.it(
					'Can then see the domains page, and Can search for a blog name, can see and select a free .wordpress address in the results',
					function() {
						const findADomainComponent = new FindADomainComponent( driver );
						findADomainComponent.searchForBlogNameAndWaitForResults( blogName );
						findADomainComponent.checkAndRetryForFreeBlogAddresses(
							expectedBlogAddresses,
							blogName
						);
						findADomainComponent.freeBlogAddress().then( actualAddress => {
							assert(
								expectedBlogAddresses.indexOf( actualAddress ) > -1,
								`The displayed free blog address: '${ actualAddress }' was not the expected addresses: '${ expectedBlogAddresses }'`
							);
							newBlogAddress = actualAddress;
						} );
						return findADomainComponent.selectFreeAddress();
					}
				);

				test.describe( `Step ${ stepNum }: Plans`, function() {
					stepNum++;

					test.it( 'Can then see the plans page and pick the free plan', function() {
						return new PickAPlanPage( driver ).selectFreePlan();
					} );

					test.describe( `Step ${ stepNum }: Account`, function() {
						stepNum++;

						test.it( 'Can then enter account details and continue', function() {
							return new CreateYourAccountPage( driver ).enterAccountDetailsAndSubmit(
								emailAddress,
								blogName,
								password
							);
						} );

						test.describe( `Step ${ stepNum }: Sign Up Processing`, function() {
							stepNum++;

							test.it(
								"Can then see the sign up processing page -  will finish and show a 'Continue' button which is clicked",
								function() {
									const signupProcessingPage = new SignupProcessingPage( driver );
									signupProcessingPage.waitForContinueButtonToBeEnabled();
									return signupProcessingPage.continueAlong();
								}
							);

							test.describe( `Step ${ stepNum }: View Site/Trampoline`, function() {
								stepNum++;

								test.it(
									'We are on the view blog page, can see trampoline, our URL and title',
									function() {
										const viewBlogPage = new ViewBlogPage( driver );
										viewBlogPage.waitForTrampolineWelcomeMessage();
										return viewBlogPage.isTrampolineWelcomeDisplayed().then( displayed => {
											return assert.equal(
												displayed,
												true,
												'The trampoline welcome message is not displayed'
											);
										} );
									}
								);

								test.it( 'Can see the correct blog URL displayed', function() {
									return new ViewBlogPage( driver ).urlDisplayed().then( url => {
										return assert.equal(
											url,
											'https://' + newBlogAddress + '/',
											'The displayed URL on the view blog page is not as expected'
										);
									} );
								} );

								if ( locale === 'en' ) {
									test.it( 'Can see the correct blog title displayed', function() {
										return new ViewBlogPage( driver ).title().then( title => {
											return assert.equal(
												title,
												'Site Title',
												'The expected blog title is not displaying correctly'
											);
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

	test.describe( 'Sign up while purchasing premium theme @parallel @email', function() {
		this.bailSuite( true );
		let stepNum = 1;

		const blogName = dataHelper.getNewBlogName();
		const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
		const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );
		const password = config.get( 'passwordForNewTestSignUps' );
		let chosenThemeName = '';

		test.it( 'Ensure we are not logged in as anyone', function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.describe( `Step ${ stepNum }: Themes Page`, function() {
			stepNum++;

			test.it( 'Can see the themes page and select premium theme ', function() {
				const themesPage = new ThemesPage( driver, true, 'with-theme' );
				themesPage.showOnlyPremiumThemes();
				themesPage.getFirstThemeName().then( name => ( chosenThemeName = name ) );
				return themesPage.selectNewTheme();
			} );

			test.it( 'Can pick theme design', function() {
				return new ThemeDetailPage( driver ).pickThisDesign();
			} );

			test.describe( `Step ${ stepNum }: Domains`, function() {
				stepNum++;

				test.it(
					'Can then see the domains page and can search for a blog name, can see and select a free WordPress.com blog address in results',
					function() {
						const findADomainComponent = new FindADomainComponent( driver );
						findADomainComponent.searchForBlogNameAndWaitForResults( blogName );
						findADomainComponent.checkAndRetryForFreeBlogAddresses(
							expectedBlogAddresses,
							blogName
						);
						findADomainComponent.freeBlogAddress().then( actualAddress => {
							assert(
								expectedBlogAddresses.indexOf( actualAddress ) > -1,
								`The displayed free blog address: '${ actualAddress }' was not the expected addresses: '${ expectedBlogAddresses }'`
							);
						} );
						return findADomainComponent.selectFreeAddress();
					}
				);

				test.describe( `Step ${ stepNum }: Plans`, function() {
					stepNum++;

					test.it( 'Can then see the plans page and pick the free plan', function() {
						return new PickAPlanPage( driver ).selectFreePlan();
					} );

					test.describe( `Step ${ stepNum }: Account`, function() {
						stepNum++;

						test.it( 'Can then enter account details and continue', function() {
							return new CreateYourAccountPage( driver ).enterAccountDetailsAndSubmit(
								emailAddress,
								blogName,
								password
							);
						} );

						test.describe( `Step ${ stepNum }: Sign Up Processing`, function() {
							stepNum++;

							test.it(
								"Can then see the sign up processing page -  will finish and show a 'Continue' button which is clicked",
								function() {
									const signupProcessingPage = new SignupProcessingPage( driver );
									signupProcessingPage.waitForContinueButtonToBeEnabled();
									return signupProcessingPage.continueAlong();
								}
							);

							test.describe( `Step ${ stepNum }: Secure Payment Page`, function() {
								stepNum++;

								test.it(
									'Can then see the secure payment page with the chosen theme in the cart',
									function() {
										return new SecurePaymentComponent( driver ).getProductsNames().then( arry => {
											assert(
												arry[ 0 ].search( chosenThemeName ),
												`First product in cart is not ${ chosenThemeName }`
											);
										} );
									}
								);
							} );
						} );
					} );
				} );
			} );
		} );
	} );
} );
