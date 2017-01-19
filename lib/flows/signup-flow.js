import webdriver from 'selenium-webdriver';
import fs from 'fs-extra';
import config from 'config';

import * as mediaHelper from '../media-helper.js';
import * as driverManager from '../driver-manager.js';
import * as dataHelper from '../data-helper.js';

import ChooseAThemePage from '../pages/signup/choose-a-theme-page.js';
import PickAPlanPage from '../pages/signup/pick-a-plan-page.js';
import CreateYourAccountPage from '../pages/signup/create-your-account-page.js';
import SignupProcessingPage from '../pages/signup/signup-processing-page.js';
import NextStepsPage from '../pages/signup/next-steps-page.js';
import CheckOutPage from '../pages/signup/checkout-page.js';
import WPHomePage from '../pages/wp-home-page.js';
import WPWebsiteHomePage from '../pages/wp-website-home-page.js';

import { GetDotBlogHomePage, GetDotBlogSearchResults, GetDotBlogEmailInfo, GetDotBlogConfirmEmail, GetDotBlogContactForm } from '../pages/get-dot-blog.js';
import EmailClient from '../email-client.js';

import FindADomainComponent from '../components/find-a-domain-component.js';
import SecurePaymentComponent from '../components/secure-payment-component.js';

export default class SignUpFlow {
	constructor( driver, screenSize ) {
		this.driver = driver;
		this.signupInboxId = config.get( 'signupInboxId' );
		if ( screenSize === undefined ) {
			this.screenSize = driverManager.currentScreenSize();
		} else {
			driverManager.resizeBrowser( driver, screenSize );
			this.screenSize = screenSize;
		}
	}
	createFreeBlogWithScreenshots( culture ) {
		var d = webdriver.promise.defer();
		var driver = this.driver;
		var screenSize = this.screenSize;

		var blogName = 'e2eflowtesting' + new Date().getTime().toString();
		var expectedDomainName = blogName + '.com';
		var password = config.get( 'passwordForNewTestSignUps' );
		var firstName = 'End to End';
		var lastName = 'Testing';
		var phoneNumber = '0422888888';
		var countryCode = 'AU';
		var address = '888 Queen Street';
		var city = 'Brisbane';
		var stateCode = 'QLD';
		var postalCode = '4000';

		const emailAddress = dataHelper.getEmailAddress( blogName, this.signupInboxId );

		this.wPWebsiteHomePage = new WPWebsiteHomePage( driver, true, culture );
		driver.sleep( 1000 );
		driver.takeScreenshot().then( function( data ) {
			mediaHelper.writeScreenshot( data, culture.toUpperCase() + '_' + screenSize + '_0A_HOME_WEBSITE_', true );
		} );

		const wPHomePage = new WPHomePage( driver, { visit: true, culture: culture, setRegularView: true } );
		driver.sleep( 1000 );
		driver.takeScreenshot().then( function( data ) {
			mediaHelper.writeScreenshot( data, culture.toUpperCase() + '_' + screenSize + '_0_HOME_', true );
		} );

		wPHomePage.createWebSite();

		const chooseAThemePage = new ChooseAThemePage( driver, { culture: culture } );
		driver.sleep( 1000 );
		driver.takeScreenshot().then( function( data ) {
			mediaHelper.writeScreenshot( data, culture.toUpperCase() + '_' + screenSize + '_1_THEME_', true );
		} );

		chooseAThemePage.selectFirstTheme();

		const findADomainComponent = new FindADomainComponent( driver );
		findADomainComponent.searchForBlogNameAndWaitForResults( blogName );
		driver.sleep( 1000 );
		driver.takeScreenshot().then( function( data ) {
			mediaHelper.writeScreenshot( data, culture.toUpperCase() + '_' + screenSize + '_2_DOMAIN_OPTIONS_', true );
		} );

		findADomainComponent.selectDotComAddress( expectedDomainName );
		findADomainComponent.selectAddEmailForGoogleApps();
		driver.sleep( 1000 );
		driver.takeScreenshot().then( function( data ) {
			mediaHelper.writeScreenshot( data, culture.toUpperCase() + '_' + screenSize + '_2A_DOMAIN_NEW_', true );
		} );

		findADomainComponent.selectPreviousStep();
		findADomainComponent.waitForResults();

		findADomainComponent.selectMapOwnDomain();
		findADomainComponent.waitForOwnDomainMapping();
		driver.sleep( 1000 );
		driver.takeScreenshot().then( function( data ) {
			mediaHelper.writeScreenshot( data, culture.toUpperCase() + '_' + screenSize + '_2B_DOMAIN_MAP_EXISTING_', true );
		} );

		findADomainComponent.selectPreviousStep();
		findADomainComponent.waitForResults();

		findADomainComponent.selectDotComAddress( expectedDomainName );
		findADomainComponent.declineGoogleApps();

		const pickAPlanPage = new PickAPlanPage( driver );
		driver.sleep( 1000 );
		driver.takeScreenshot().then( function( data ) {
			mediaHelper.writeScreenshot( data, culture.toUpperCase() + '_' + screenSize + '_3_PLAN_', true );
		} );

		pickAPlanPage.compare();
		pickAPlanPage.waitForPlanComparisons();
		driver.sleep( 1000 );
		driver.takeScreenshot().then( function( data ) {
			mediaHelper.writeScreenshot( data, culture.toUpperCase() + '_' + screenSize + '_3A_PLAN_COMPARISON_', true );
		} );

		pickAPlanPage.goBackToPlans();
		pickAPlanPage.waitForPlans();
		pickAPlanPage.selectPremiumPlan();

		const createYourAccountPage = new CreateYourAccountPage( driver );
		driver.sleep( 1000 );
		driver.takeScreenshot().then( function( data ) {
			mediaHelper.writeScreenshot( data, culture.toUpperCase() + '_' + screenSize + '_4_ACCOUNT_', true );
		} );

		driver.sleep( 1000 );
		createYourAccountPage.enterAccountDetailsAndSubmit( ' ', ' ', '' );
		driver.sleep( 1000 );
		createYourAccountPage.waitForValidationErrors();

		driver.sleep( 1000 );
		driver.takeScreenshot().then( function( data ) {
			mediaHelper.writeScreenshot( data, culture.toUpperCase() + '_' + screenSize + '_4A_ACCOUNT_VALIDATION_BLANK_', true );
		} );

		driver.sleep( 1000 );
		createYourAccountPage.enterAccountDetailsAndSubmit( 'notanemailaddrees', 'e2eflowtesting', 'password' );
		driver.sleep( 1000 );
		createYourAccountPage.waitForValidationErrors();

		driver.sleep( 1000 );
		driver.takeScreenshot().then( function( data ) {
			mediaHelper.writeScreenshot( data, culture.toUpperCase() + '_' + screenSize + '_4B_ACCOUNT_VALIDATION_INVALID_', true );
		} );

		driver.sleep( 1000 );
		createYourAccountPage.enterAccountDetailsAndSubmit( emailAddress, blogName, password );

		const signupProcessingPage = new SignupProcessingPage( driver );
		driver.sleep( 1000 );
		driver.takeScreenshot().then( function( data ) {
			mediaHelper.writeScreenshot( data, culture.toUpperCase() + '_' + screenSize + '_5_PROCESSING_', true );
		} );

		signupProcessingPage.waitToDisappear();

		const checkOutPage = new CheckOutPage( driver );
		driver.sleep( 1000 );
		driver.takeScreenshot().then( function( data ) {
			mediaHelper.writeScreenshot( data, culture.toUpperCase() + '_' + screenSize + '_5A_DOMAIN_REG_', true );
		} );

		checkOutPage.selectAddPrivacyProtection();
		driver.sleep( 2000 );
		driver.takeScreenshot().then( function( data ) {
			mediaHelper.writeScreenshot( data, culture.toUpperCase() + '_' + screenSize + '_5B_DOMAIN_REG_VALIDATION_', true );
		} );

		driver.sleep( 2000 );
		checkOutPage.enterRegistarDetails( firstName, lastName, emailAddress, phoneNumber, countryCode, address, city, stateCode, postalCode );
		driver.sleep( 2000 );
		checkOutPage.selectAddPrivacyProtection();

		const securePaymentComponent = new SecurePaymentComponent( driver );
		driver.sleep( 1000 );
		driver.takeScreenshot().then( function( data ) {
			mediaHelper.writeScreenshot( data, culture.toUpperCase() + '_' + screenSize + '_5C_DOMAIN_PAYMENT_FORM_', true );
		} );

		securePaymentComponent.submitPaymentDetails();
		driver.sleep( 1000 );
		driver.takeScreenshot().then( function( data ) {
			mediaHelper.writeScreenshot( data, culture.toUpperCase() + '_' + screenSize + '_5D_DOMAIN_PAYMENT_FORM_VALIDATION_', true );
		} );

		const nextStepsPage = new NextStepsPage( driver, true ); //eslint-disable-line no-unused-vars
		driver.sleep( 1000 );
		driver.takeScreenshot().then( function( data ) {
			mediaHelper.writeScreenshot( data, culture.toUpperCase() + '_' + screenSize + '_6_NEXT_STEPS_', true );
		} );

		d.fulfill( true );
		return d.promise;
	}
	createGetDotBlogWithScreenshots( culture ) {
		var d = webdriver.promise.defer();
		var driver = this.driver;
		var screenSize = this.screenSize;
		var stepNum = 0;
		const filePrefix = culture.toUpperCase() + '_' + screenSize;

		const blogName = 'e2eflowtesting' + new Date().getTime().toString();
		const emailAddress = dataHelper.getEmailAddress( blogName, this.signupInboxId );
		const emailClient = new EmailClient( this.signupInboxId );

		const personalInfo = {
			firstName: 'End to End',
			lastName: 'Testing',
			email: emailAddress,
			phoneNumber: '+0422888888',
			countryCode: 'AU',
			address: '888 Queen Street',
			city: 'Brisbane',
			stateCode: 'QLD',
			postalCode: '4000'
		};

		// Load https://get.blog
		this.dotBlogHomePage = new GetDotBlogHomePage( driver, { visit: true, culture: culture } );
		driver.sleep( 4000 );
		driver.takeScreenshot().then( function( data ) {
			stepNum++;
			mediaHelper.writeScreenshot( data, `${filePrefix}_${stepNum}_HOMEPAGE`, true );
		} );

		// Search for domain
		this.dotBlogHomePage.searchForDomain( blogName );
		driver.sleep( 4000 );
		driver.takeScreenshot().then( function( data ) {
			stepNum++;
			mediaHelper.writeScreenshot( data, `${filePrefix}_${stepNum}_SEARCH_RESULTS`, true );
		} );

		// Select first result
		this.dotBlogSearchResults = new GetDotBlogSearchResults( driver );
		this.dotBlogSearchResults.selectFirstResult();
		driver.sleep( 4000 );
		driver.takeScreenshot().then( function( data ) {
			stepNum++;
			mediaHelper.writeScreenshot( data, `${filePrefix}_${stepNum}_EMAIL_ADDRESS`, true );
		} );

		// Submit bad e-mail
		this.dotBlogContactInfo = new GetDotBlogEmailInfo( driver );
		this.dotBlogContactInfo.submitEmail( 'INVALID E-MAIL' );
		driver.sleep( 6000 );
		driver.takeScreenshot().then( function( data ) {
			stepNum++;
			mediaHelper.writeScreenshot( data, `${filePrefix}_${stepNum}_BAD_EMAIL`, true );
		} );

		// Submit e-mail
		this.dotBlogContactInfo.submitEmail( emailAddress );
		driver.sleep( 6000 );
		driver.takeScreenshot().then( function( data ) {
			stepNum++;
			mediaHelper.writeScreenshot( data, `${filePrefix}_${stepNum}_CHECK_YOUR_EMAIL`, true );
		} );

		// Click 'use confirmation code'
		this.dotBlogConfirmEmail = new GetDotBlogConfirmEmail( driver );
		this.dotBlogConfirmEmail.clickUseConfirmationCode();
		driver.sleep( 6000 );
		driver.takeScreenshot().then( function( data ) {
			stepNum++;
			mediaHelper.writeScreenshot( data, `${filePrefix}_${stepNum}_USE_CODE`, true );
		} );

		// Get e-mail
		let acceptInviteURL = '';
		emailClient.pollEmailsByRecipient( emailAddress ).then( ( emails ) => {
			let links = emails[0].html.links;
			for ( let link of links ) {
				if ( link.href.includes( 'sign-up-with-email' ) ) {
					acceptInviteURL = link.href;
				}
			}

			// Save e-mail HTML and open file
			fs.writeFileSync( '/tmp/email.html', emails[0].html.body );
			driver.get( 'file:///tmp/email.html' );
			driver.sleep( 1000 );
			driver.takeScreenshot().then( function( data ) {
				stepNum++;
				mediaHelper.writeScreenshot( data, `${filePrefix}_${stepNum}_EMAIL_BODY`, true );
			} );

			// Accept invite
			return driver.get( acceptInviteURL );
		} );
		driver.sleep( 10000 );
		driver.takeScreenshot().then( function( data ) {
			stepNum++;
			mediaHelper.writeScreenshot( data, `${filePrefix}_${stepNum}_ACCOUNT_INFO`, true );
		} );

		// Submit empty contact form
		this.contactForm = new GetDotBlogContactForm( driver );
		this.contactForm.clearEmail();
		driver.sleep( 2000 );
		this.contactForm.submitDetails();
		driver.sleep( 5000 );
		driver.takeScreenshot().then( function( data ) {
			stepNum++;
			mediaHelper.writeScreenshot( data, `${filePrefix}_${stepNum}_EMPTY_CONTACT_FORM`, true );
		} );

		// Fill out most of contact form
		this.contactForm.inputDetails( personalInfo );
		driver.sleep( 5000 );
		driver.takeScreenshot().then( function( data ) {
			stepNum++;
			mediaHelper.writeScreenshot( data, `${filePrefix}_${stepNum}_STATE_ERROR`, true );
		} );

		// Add state/territory and submit
		this.contactForm.inputState( personalInfo.stateCode );
		driver.sleep( 2000 );
		this.contactForm.submitDetails();
		driver.sleep( 5000 );
		driver.takeScreenshot().then( function( data ) {
			stepNum++;
			mediaHelper.writeScreenshot( data, `${filePrefix}_${stepNum}_PAYMENT_INFO`, true );
		} );

		// Submit empty payment form
		this.contactForm.clearNameAndPostalCode();
		driver.sleep( 2000 );
		this.contactForm.submitDetails();
		driver.sleep( 5000 );
		driver.takeScreenshot().then( function( data ) {
			stepNum++;
			mediaHelper.writeScreenshot( data, `${filePrefix}_${stepNum}_EMPTY_PAYMENT_FORM_ERRORS`, true );
		} );

		d.fulfill( true );
		return d.promise;
	}
}
