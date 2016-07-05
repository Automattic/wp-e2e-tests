import test from 'selenium-webdriver/testing';
import config from 'config';
import assert from 'assert';

import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper.js';

import WPHomePage from '../lib/pages/wp-home-page.js';
import ChooseAThemePage from '../lib/pages/signup/choose-a-theme-page.js';
import StartPage from '../lib/pages/signup/start-page.js';
import StartPremiumPage from '../lib/pages/signup/start-premium-page.js';
import StartBusinessPage from '../lib/pages/signup/start-business-page.js';
import SurveyPage from '../lib/pages/signup/survey-page.js';
import DesignTypeChoicePage from '../lib/pages/signup/design-type-choice-page.js';
import PickAPlanPage from '../lib/pages/signup/pick-a-plan-page.js';
import CreateYourAccountPage from '../lib/pages/signup/create-your-account-page.js';
import SignupProcessingPage from '../lib/pages/signup/signup-processing-page.js';
import CheckOutPage from '../lib/pages/signup/checkout-page';
import CheckOutThankyouPage from '../lib/pages/signup/checkout-thankyou-page.js';
import ViewBlogPage from '../lib/pages/signup/view-blog-page.js';
import PostsPage from '../lib/pages/posts-page';
import CustomizerPage from '../lib/pages/customizer-page';

import FindADomainComponent from '../lib/components/find-a-domain-component.js';
import SecurePaymentComponent from '../lib/components/secure-payment-component.js';
import NavBarComponent from '../lib/components/navbar-component';
import SidebarComponent from '../lib/components/sidebar-component';

import EmailClient from '../lib/email-client.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const signupInboxId = config.get( 'signupInboxId' );
const calypsoBaseUrl = config.get( 'calypsoBaseURL' );

var driver;

test.before( 'Start Browser', function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.xdescribe( 'Post-NUX Flows (' + screenSize + ')', function() {
	this.timeout( mochaTimeOut );

	test.describe( 'Perform all the Post-NUX Flows', function() {
		this.bailSuite( true );

		const blogName = 'e2e' + new Date().getTime().toString();
		const emailName = new Date().getTime().toString();
		const expectedBlogAddress = blogName + '.wordpress.com';

		const emailAddress = dataHelper.getEmailAddress( emailName, signupInboxId );
		const password = config.get( 'passwordForNewTestSignUps' );
		let activateAccountURL = '';

		test.it( 'Ensure we are not logged in as anyone', function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.describe( 'Sign Up for a Free Site', function() {
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
													this.emailClient = new EmailClient( signupInboxId );
												} );

												test.it( 'Can see a single activation message', function() {
													return this.emailClient.pollEmailsByRecipient( emailAddress ).then( function( emails ) {
														assert.equal( emails.length, 1, 'The number of activations emails is not equal to 1' );
													} );
												} );

												test.it( 'Can capture the Confirm Email link from the email', function() {
													return this.emailClient.pollEmailsByRecipient( emailAddress ).then( function( emails ) {
														let links = emails[0].html.links;
														for ( let link of links ) {
															if ( link.href.includes( 'activate' ) ) {
																activateAccountURL = link.href;
																activateAccountURL = activateAccountURL.replace( 'https://wordpress.com', calypsoBaseUrl );
																if ( config.has( 'liveBranch' ) && config.get( 'liveBranch' ) === 'true' ) {
																	activateAccountURL = activateAccountURL + '?branch=' + config.get( 'branchName' );
																}
															}
														}
														assert.notEqual( activateAccountURL, '', 'Could not locate the accept invite URL in the invite email' );
													} );
												} );

												test.it( 'Visit the activation url to activate our account and see the blog posts page', function() {
													driver.get( activateAccountURL );
													this.postsPage = new PostsPage( driver );
													this.postsPage.displayed().then( ( displayed ) => {
														assert( displayed, 'The blog posts page was not displayed' );
													} );
												} );

												test.describe( 'Visit the customizer to perform post-nux flows/direct manipulation', function() {
													test.it( 'Can select customize from the sidebar menu', function() {
														this.navBarComponent = new NavBarComponent( driver );
														this.navBarComponent.clickMySites();
														this.sidebarComponent = new SidebarComponent( driver );
														this.sidebarComponent.customizeTheme();
													} );

													test.it( 'Can see the customizer', function() {
														this.customizerPage = new CustomizerPage( driver );
														this.customizerPage.displayed().then( ( displayed ) => {
															assert( displayed, 'The customizer page was not displayed' );
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
