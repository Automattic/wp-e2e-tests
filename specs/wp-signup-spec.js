import test from 'selenium-webdriver/testing';
import config from 'config';
import assert from 'assert';

import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper.js';
import * as driverHelper from '../lib/driver-helper.js';

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
// import EditorPage from '../lib/pages/editor-page.js';
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

import FindADomainComponent from '../lib/components/find-a-domain-component.js';
import SecurePaymentComponent from '../lib/components/secure-payment-component.js';
// import PostEditorToolbarComponent from '../lib/components/post-editor-toolbar-component.js';
import NavBarComponent from '../lib/components/navbar-component';
import SideBarComponent from '../lib/components/sidebar-component';

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

	test.describe( 'Sign up for a free site and log in via a magic link @parallel @email', function() {
		this.bailSuite( true );
		let stepNum = 1;

		const blogName = dataHelper.getNewBlogName();
		let newBlogAddress = '';
		const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
		const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );
		const password = config.get( 'passwordForNewTestSignUps' );
		let magicLoginLink;

		test.it( 'Ensure we are not logged in as anyone', function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.describe( `Step ${stepNum}: About Page`, function() {
			stepNum++;

			test.it( 'Can see the about page', function() {
				this.startPage = new StartPage( driver, { visit: true, culture: locale } );
				this.aboutPage = new AboutPage( driver );
				return this.aboutPage.displayed().then( ( displayed ) => {
					return assert.equal( displayed, true, 'The about page is not displayed' );
				} );
			} );

			test.it( 'Can accept defaults for about page', function() {
				this.aboutPage.submitForm();
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

								test.describe( `Step ${stepNum}: Log out and request magic link`, function() {
									stepNum++;

									// Ensure logged out
									test.before( function() {
										return driverManager.clearCookiesAndDeleteLocalStorage( driver );
									} );

									test.it( 'Request a magic link', function() {
										this.loginPage = new LoginPage( driver, true );
										return this.loginPage.requestMagicLink( emailAddress );
									} );

									test.describe( `Step ${stepNum}: Can see email containing magic link`, function() {
										stepNum++;

										test.before( function() {
											return this.emailClient = new EmailClient( signupInboxId );
										} );

										test.it( 'Can see a the magic link email', function() {
											return this.emailClient.pollEmailsByRecipient( emailAddress ).then( function( emails ) {
												//Disabled due to a/b test on activation email. See https://github.com/Automattic/wp-e2e-tests/issues/819
												//assert.equal( emails.length, 2, 'The number of newly registered emails is not equal to 2 (activation and magic link)' );
												for ( let email of emails ) {
													if ( email.subject.indexOf( 'WordPress.com' ) > -1 ) {
														magicLoginLink = email.html.links[0].href;
													}
												}
												assert( magicLoginLink !== undefined, 'Could not locate the magic login link email link' );
												return true;
											} );
										} );

										test.describe( `Step ${stepNum}: Visit the magic link and we should be logged in`, function() {
											stepNum++;

											test.it( 'Visit the magic link and we\'re logged in', function() {
												driver.get( magicLoginLink );
												this.magicLoginPage = new MagicLoginPage( driver );
												this.magicLoginPage.finishLogin();
												let readerPage = new ReaderPage( driver );
												return readerPage.displayed().then( function( displayed ) {
													return assert.equal( displayed, true, 'The reader page is not displayed after log in' );
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

	test.describe( 'Sign up for a site on a premium paid plan through main flow @parallel', function() {
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

		test.describe( `Step ${stepNum}: About Page`, function() {
			stepNum++;

			test.it( 'Can see the about page', function() {
				this.startPage = new StartPage( driver, { visit: true, culture: locale } );
				this.aboutPage = new AboutPage( driver );
				return this.aboutPage.displayed().then( ( displayed ) => {
					return assert.equal( displayed, true, 'The about page is not displayed' );
				} );
			} );

			test.it( 'Can accept defaults for about page', function() {
				this.aboutPage.submitForm();
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

		test.describe( `Step ${stepNum}: About Page`, function() {
			stepNum++;

			test.it( 'Can see the about page', function() {
				this.startPage = new StartPage( driver, { visit: true, culture: locale, flow: 'premium' } );
				this.aboutPage = new AboutPage( driver );
				return this.aboutPage.displayed().then( ( displayed ) => {
					return assert.equal( displayed, true, 'The about page is not displayed' );
				} );
			} );

			test.it( 'Can accept defaults for about page', function() {
				this.aboutPage.submitForm();
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

	test.describe( 'Sign up for a domain only purchase coming in from wordpress.com/domains @parallel', function() {
		this.bailSuite( true );
		let stepNum = 1;
		const siteName = dataHelper.getNewBlogName();
		const expectedDomainName = `${siteName}.live`;
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

		test.it( 'We can visit set the sandbox cookie for payments', function() {
			this.WPHomePage = new WPHomePage( driver, { visit: true, culture: locale } );
			return this.WPHomePage.setSandboxModeForPayments( sandboxCookieValue );
		} );

		test.describe( `Step ${stepNum}: WordPress.com/domains page`, function() {
			stepNum++;

			test.it( 'Can visit the domains start page', function() {
				this.startPage = new StartPage( driver, { visit: true, culture: locale, flow: 'domain-first', domainFirst: true, domainFirstDomain: expectedDomainName } );
			} );

			test.it( 'Can select domain only from the domain first choice page', function() {
				this.domainFirstChoicePage = new DomainFirstPage( driver );
				return this.domainFirstChoicePage.chooseJustBuyTheDomain();
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

						test.it( 'Can then see the secure payment page', function() {
							this.securePaymentComponent = new SecurePaymentComponent( driver );
							return this.securePaymentComponent.displayed().then( ( displayed ) => {
								return assert.equal( displayed, true, 'The secure payment page is not displayed' );
							} );
						} );

						test.it( 'Can enter and submit test payment details', function() {
							this.securePaymentComponent.enterTestCreditCardDetails( testCreditCardDetails );
							this.securePaymentComponent.submitPaymentDetails();
							this.securePaymentComponent.waitForCreditCardPaymentProcessing();
							return this.securePaymentComponent.waitForPageToDisappear();
						} );

						test.describe( `Step ${stepNum}: Checkout Thank You Page`, function() {
							stepNum++;

							test.it( 'Can see the secure check out thank you page and click "go to my domain" button to see the domain only settings page', function() {
								this.checkOutThankyouPage = new CheckOutThankyouPage( driver );
								this.checkOutThankyouPage.goToMyDomain();
								this.domainOnlySettingsPage = new DomainOnlySettingsPage( driver );
								this.domainOnlySettingsPage.manageDomain();
								this.domainDetailsPage = new DomainDetailsPage( driver );
								this.domainDetailsPage.displayed().then( ( displayed ) => {
									assert.equal( displayed, true, 'The domain details page is not displayed' );
								} );
							} );

							test.describe( `Step ${stepNum}: View Calypso Menus`, function() {
								stepNum++;

								// Open the sidebar
								test.before( function() {
									let navBarComponent = new NavBarComponent( driver );
									navBarComponent.clickMySites();
								} );

								test.it( 'We should only one option', function() {
									let sideBarComponent = new SideBarComponent( driver );
									return sideBarComponent.numberOfMenuItems().then( ( numberMenuItems ) => {
										assert.equal( numberMenuItems, 1, 'There is not a single menu item for a domain only site' );
									} );
								} );

								test.it( 'We should see the Settings option', function() {
									let sideBarComponent = new SideBarComponent( driver );
									return sideBarComponent.settingsOptionExists().then( ( exists ) => {
										assert( exists, 'The settings menu option does not exist' );
									} );
								} );

								test.describe( `Step ${stepNum}: Cancel the domain via purchases`, function() {
									stepNum++;

									test.it( 'Cancel the domain', function() {
										let sideBarComponent = new SideBarComponent( driver );
										sideBarComponent.selectSettings();

										let domainOnlySettingsPage = new DomainOnlySettingsPage( driver );
										domainOnlySettingsPage.manageDomain();

										let domainDetailsPage = new DomainDetailsPage( driver );
										domainDetailsPage.viewPaymentSettings();

										let managePurchasePage = new ManagePurchasePage( driver );
										managePurchasePage.domainDisplayed().then( ( domainDisplayed ) => {
											assert.equal( domainDisplayed, expectedDomainName, 'The domain displayed on the manage purchase page is unexpected' );
										} );
										managePurchasePage.chooseCancelAndRefund();

										let cancelPurchasePage = new CancelPurchasePage( driver );
										cancelPurchasePage.clickCancelPurchase();

										let cancelDomainPage = new CancelDomainPage( driver );
										cancelDomainPage.completeSurveyAndConfirm();
										cancelDomainPage.waitToDisappear();

										let purchasesPage = new PurchasesPage( driver );
										purchasesPage.waitForAndDismissSuccessMessage();
										return purchasesPage.isEmpty().then( ( empty ) => {
											return assert( empty, 'The purchases page is not empty after cancelling the domain' );
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

	test.describe( 'Sign up for a site on a business paid plan w/ domain name coming in via /create as business flow @parallel', function() {
		this.bailSuite( true );
		let stepNum = 1;

		const siteName = dataHelper.getNewBlogName();
		const expectedDomainName = `${siteName}.live`;
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

		test.describe( `Step ${stepNum}: About Page`, function() {
			stepNum++;

			test.it( 'Can see the about page', function() {
				this.startPage = new StartPage( driver, { visit: true, culture: locale, flow: 'business' } );
				this.aboutPage = new AboutPage( driver );
				return this.aboutPage.displayed().then( ( displayed ) => {
					return assert.equal( displayed, true, 'The about page is not displayed' );
				} );
			} );

			test.it( 'Can accept defaults for about page', function() {
				this.aboutPage.submitForm();
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
						this.findADomainComponent.searchForBlogNameAndWaitForResults( expectedDomainName );
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
									this.securePaymentComponent.enterTestCreditCardDetails( testCreditCardDetails );
									this.securePaymentComponent.submitPaymentDetails();
									this.securePaymentComponent.waitForCreditCardPaymentProcessing();
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

									test.describe( `Step ${stepNum}: Cancel the domain via purchases`, function() {
										stepNum++;

										test.it( 'Cancel the domaiun', function() {
											let navBarComponent = new NavBarComponent( driver );
											navBarComponent.clickProfileLink();

											let profilePage = new ProfilePage( driver );
											profilePage.chooseManagePurchases();

											let purchasesPage = new PurchasesPage( driver );
											purchasesPage.dismissGuidedTour();
											purchasesPage.selectBusinessPlan( driver );

											let managePurchasePage = new ManagePurchasePage( driver );
											managePurchasePage.chooseCancelAndRefund();

											let cancelPurchasePage = new CancelPurchasePage( driver );
											cancelPurchasePage.clickCancelPurchase();
											cancelPurchasePage.completeCancellationSurvey();
											cancelPurchasePage.waitToDisappear();
											purchasesPage.waitForAndDismissSuccessMessage();

											purchasesPage.selectDomainInPlan( );

											managePurchasePage = new ManagePurchasePage( driver );
											managePurchasePage.domainDisplayed().then( ( domainDisplayed ) => {
												assert.equal( domainDisplayed, expectedDomainName, 'The domain displayed on the manage purchase page is unexpected' );
											} );
											managePurchasePage.chooseRemovePurchase();
											managePurchasePage.removeNow();
											managePurchasePage.waitTillRemoveNoLongerShown();

											purchasesPage.waitForAndDismissSuccessMessage();
											return purchasesPage.isEmpty().then( ( empty ) => {
												return assert( empty, 'The purchases page is not empty after cancelling the domain' );
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

	test.describe( 'Partially sign up for a site on a business paid plan w/ domain name through main flow @parallel', function() {
		this.bailSuite( true );
		let stepNum = 1;

		const siteName = dataHelper.getNewBlogName();
		const expectedDomainName = `${siteName}.live`;
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

		test.describe( `Step ${stepNum}: About Page`, function() {
			stepNum++;

			test.it( 'Can see the about page', function() {
				this.startPage = new StartPage( driver, { visit: true, culture: locale } );
				this.aboutPage = new AboutPage( driver );
				return this.aboutPage.displayed().then( ( displayed ) => {
					return assert.equal( displayed, true, 'The about page is not displayed' );
				} );
			} );

			test.it( 'Can accept defaults for about page', function() {
				this.aboutPage.submitForm();
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
					this.findADomainComponent.searchForBlogNameAndWaitForResults( expectedDomainName );
					return this.findADomainComponent.selectDotComAddress( expectedDomainName );
				} );

				test.describe( `Step ${stepNum}: Plans`, function() {
					stepNum++;

					test.it( 'Can then see the plans page', function() {
						this.pickAPlanPage = new PickAPlanPage( driver );
						return this.pickAPlanPage.displayed().then( ( displayed ) => {
							return assert.equal( displayed, true, 'The pick a plan page is not displayed' );
						} );
					} );

					test.it( 'Can select the business plan', function() {
						return this.pickAPlanPage.selectBusinessPlan();
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

								test.it( 'Can enter and submit test payment details and finish', function() {
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

	test.describe( 'Basic sign up for a free site @parallel @email @canary', function() {
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

		test.describe( `Step ${stepNum}: About Page`, function() {
			stepNum++;

			test.it( 'Can see the about page', function() {
				this.startPage = new StartPage( driver, { visit: true, culture: locale } );
				this.aboutPage = new AboutPage( driver );
				return this.aboutPage.displayed().then( ( displayed ) => {
					return assert.equal( displayed, true, 'The about page is not displayed' );
				} );
			} );

			test.it( 'Can accept defaults for about page', function() {
				this.aboutPage.submitForm();
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

	test.describe( 'Sign up while purchasing premium theme @parallel @email', function() {
		this.bailSuite( true );
		let stepNum = 1;

		const blogName = dataHelper.getNewBlogName();
		const expectedBlogAddresses = dataHelper.getExpectedFreeAddresses( blogName );
		const emailAddress = dataHelper.getEmailAddress( blogName, signupInboxId );
		const password = config.get( 'passwordForNewTestSignUps' );

		test.it( 'Ensure we are not logged in as anyone', function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.describe( `Step ${stepNum}: Themes Page`, function() {
			stepNum++;

			test.it( 'Can see the themes page', function() {
				this.themesPage = new ThemesPage( driver, true );
				return this.themesPage.displayed().then( ( displayed ) => {
					return assert.equal( displayed, true, 'The about page is not displayed' );
				} );
			} );

			test.it( 'Can select premium theme', function() {
				this.name = '';
				this.themesPage.showOnlyPremiumThemes();
				this.themesPage.getFirstThemeName().then( name => this.name = name );
				return this.themesPage.selectNewTheme();
			} );

			test.it( 'Can pick theme design', function() {
				this.themePage = new ThemeDetailPage( driver );
				return this.themePage.pickThisDesign();
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

							test.describe( `Step ${stepNum}: Secure Payment Page`, function() {
								stepNum++;

								test.it( 'Can then see the secure payment page', function() {
									this.securePaymentComponent = new SecurePaymentComponent( driver );
									return this.securePaymentComponent.displayed().then( ( displayed ) => {
										return assert.equal( displayed, true, 'The secure payment page is not displayed' );
									} );
								} );

								test.it( 'Can ensure that theme is added into Cart', function() {
									return this.securePaymentComponent.getProductsNames().then( ( arry ) => {
										assert( arry[0].search( this.name ), `First product in cart is not ${this.name}` );
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
