/** @format */

import config from 'config';

import StartPage from '../pages/signup/start-page';
import CreateYourAccountPage from '../pages/signup/create-your-account-page';
import SignupProcessingPage from '../pages/signup/signup-processing-page';

import * as driverManager from '../driver-manager';
import * as dataHelper from '../data-helper';

import EmailClient from '../email-client';
import ReaderPage from '../pages/reader-page';

const signupInboxId = config.get( 'signupInboxId' );

export default class SignUpFlow {
	constructor( driver, { accountName, emailAddress, password } ) {
		this.driver = driver;
		this.emailClient = new EmailClient( signupInboxId );

		this.accountName = accountName || dataHelper.getNewBlogName();
		this.emailAddress =
			emailAddress || dataHelper.getEmailAddress( this.accountName, signupInboxId );
		this.password = password || config.get( 'passwordForNewTestSignUps' );
	}

	signupFreeAccount() {
		return driverManager
			.ensureNotLoggedIn( this.driver )
			.then( () => {
				global.__TEMPJETPACKHOST__ = 'WPCOM';
				new StartPage( this.driver, { visit: true, flow: 'account' } ).displayed();
				return new CreateYourAccountPage( this.driver ).enterAccountDetailsAndSubmit(
					this.emailAddress,
					this.accountName,
					this.password
				);
			} )
			.then( () => {
				this.signupProcessingPage = new SignupProcessingPage( this.driver );
				return this.signupProcessingPage.waitForContinueButtonToBeEnabled();
			} )
			.then( () => this.signupProcessingPage.continueAlong() )
			.then( () => {
				return new ReaderPage( this.driver ).displayed();
			} )
			.then( () => ( global.__TEMPJETPACKHOST__ = false ) );
	}

	activateAccount() {
		return this.emailClient
			.pollEmailsByRecipient( this.emailAddress )
			.then( emails => {
				for ( let email of emails ) {
					if ( email.subject.indexOf( 'Activate' ) > -1 ) {
						return email.html.links[ 0 ].href;
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
