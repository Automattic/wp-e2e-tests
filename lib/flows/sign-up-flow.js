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

	async signupFreeAccount() {
		await driverManager.ensureNotLoggedIn( this.driver );
		global.__TEMPJETPACKHOST__ = 'WPCOM';
		await StartPage.Visit( this.driver, StartPage.getStartURL( { flow: 'account' } ) );
		const createYourAccountPage = await CreateYourAccountPage.Expect( this.driver );
		await createYourAccountPage.enterAccountDetailsAndSubmit(
			this.emailAddress,
			this.accountName,
			this.password
		);
		const signupProcessingPage = await SignupProcessingPage.Expect( this.driver );
		await signupProcessingPage.waitForContinueButtonToBeEnabled();
		await signupProcessingPage.continueAlong();
		const readerPage = new ReaderPage( this.driver );
		await readerPage.displayed();
		global.__TEMPJETPACKHOST__ = false;
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
