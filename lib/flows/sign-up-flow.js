import config from 'config';

import StartPage from '../pages/signup/start-page.js';
import AboutPage from '../pages/signup/about-page.js';
import PickAPlanPage from '../pages/signup/pick-a-plan-page.js';
import CreateYourAccountPage from '../pages/signup/create-your-account-page.js';
import SignupProcessingPage from '../pages/signup/signup-processing-page.js';
import ViewBlogPage from '../pages/signup/view-blog-page.js';

import FindADomainComponent from '../components/find-a-domain-component.js';

import * as driverManager from '../driver-manager';
import * as dataHelper from '../data-helper';

import EmailClient from '../email-client.js';
import ReaderPage from '../pages/reader-page.js';

const signupInboxId = config.get( 'signupInboxId' );

export default class SignUpFlow {
	constructor( driver, {blogName, expectedBlogAddresses, emailAddress, password} ) {
		this.driver = driver;
		this.emailClient = new EmailClient( signupInboxId );

		this.blogName = blogName || dataHelper.getNewBlogName();
		this.expectedBlogAddresses = expectedBlogAddresses || dataHelper.getExpectedFreeAddresses( this.blogName );
		this.emailAddress = emailAddress || dataHelper.getEmailAddress( this.blogName, signupInboxId );
		this.password = password || config.get( 'passwordForNewTestSignUps' );
	}

	signupFreePlan() {
		return driverManager.ensureNotLoggedIn( this.driver )
		.then( () => {
			global.__TEMPJETPACKHOST__ = 'WPCOM';
			this.startPage = new StartPage( this.driver, { visit: true } );
			this.aboutPage = new AboutPage( this.driver );
			return this.aboutPage.submitForm();
		} )
		.then( () => {
			this.findADomainComponent = new FindADomainComponent( this.driver );
			return this.findADomainComponent.searchForBlogNameAndWaitForResults( this.blogName );
		} )
		.then( () => this.findADomainComponent.checkAndRetryForFreeBlogAddresses( this.expectedBlogAddresses, this.blogName ) )
		.then( () => this.findADomainComponent.freeBlogAddress() )
		.then( () => this.findADomainComponent.selectFreeAddress() )
		.then( () => {
			this.pickAPlanPage = new PickAPlanPage( this.driver );
			return this.pickAPlanPage.selectFreePlan();
		} )
		.then( () => {
			this.createYourAccountPage = new CreateYourAccountPage( this.driver );
			return this.createYourAccountPage.enterAccountDetailsAndSubmit( this.emailAddress, this.blogName, this.password );
		} )
		.then( () => {
			this.signupProcessingPage = new SignupProcessingPage( this.driver );
			return this.signupProcessingPage.waitForContinueButtonToBeEnabled();
		} )
		.then( () => this.signupProcessingPage.continueAlong() )
		.then( () => {
			this.viewBlogPage = new ViewBlogPage( this.driver );
			return this.viewBlogPage.waitForTrampolineWelcomeMessage();
		} )
		.then( () => global.__TEMPJETPACKHOST__ = false );
	}

	activateAccount() {
		return this.emailClient.pollEmailsByRecipient( this.emailAddress )
			.then( emails => {
				for ( let email of emails ) {
					if ( email.subject.indexOf( 'Activate' ) > -1 ) {
						return email.html.links[0].href;
					}
				}
			} )
			.then( activationLink => {
				this.driver.get( activationLink );
				let readerPage = new ReaderPage( this.driver, true );
				return readerPage.waitForPage();
			} );
	}
}