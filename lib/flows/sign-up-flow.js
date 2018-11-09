/** @format */

import config from 'config';
import assert from 'assert';

import StartPage from '../pages/signup/start-page';
import CreateYourAccountPage from '../pages/signup/create-your-account-page';
import SignupProcessingPage from '../pages/signup/signup-processing-page';

import * as driverManager from '../driver-manager';
import * as dataHelper from '../data-helper';

import EmailClient from '../email-client';
import ReaderPage from '../pages/reader-page';
import FindADomainComponent from '../components/find-a-domain-component';

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
		await signupProcessingPage.waitToDisappear( this.accountName, this.password );
		const readerPage = await ReaderPage.Expect( this.driver );
		await readerPage.displayed();
		global.__TEMPJETPACKHOST__ = false;
	}

	async activateAccount() {
		let activationLink;
		const emails = await this.emailClient.pollEmailsByRecipient( this.emailAddress );
		for ( let email of emails ) {
			if ( email.subject.indexOf( 'Activate' ) > -1 ) {
				activationLink = email.html.links[ 0 ].href;
			}
		}
		await this.driver.get( activationLink );
		const readerPage = await ReaderPage.Expect( this.driver );
		return await readerPage.waitForPage();
	}

	async continueAlong( blogName, passwordForTestAccounts ) {
		if ( global.browserName === 'Internet Explorer' ) {
			return;
		}
		const signupProcessingPage = await SignupProcessingPage.Expect( this.driver );
		return await signupProcessingPage.waitToDisappear( blogName, passwordForTestAccounts );
	}

	async selectFreeWordPressDotComAddresss( blogName, expectedBlogAddresses ) {
		const findADomainComponent = await FindADomainComponent.Expect( this.driver );
		await findADomainComponent.searchForBlogNameAndWaitForResults( blogName );
		await findADomainComponent.checkAndRetryForFreeBlogAddresses( expectedBlogAddresses, blogName );
		let actualAddress = await findADomainComponent.freeBlogAddress();
		assert(
			expectedBlogAddresses.indexOf( actualAddress ) > -1,
			`The displayed free blog address: '${ actualAddress }' was not the expected addresses: '${ expectedBlogAddresses }'`
		);

		return await findADomainComponent.selectFreeAddress();
	}
}
