/** @format */

import config from 'config';

import * as driverManager from '../../lib/driver-manager.js';
import * as dataHelper from '../../lib/data-helper.js';

import StartPage from '../../lib/pages/signup/start-page.js';
import CreateYourAccountPage from '../../lib/pages/signup/create-your-account-page.js';
import SignupProcessingPage from '../../lib/pages/signup/signup-processing-page.js';
import ReaderPage from '../../lib/pages/reader-page';
import NavBarComponent from '../../lib/components/nav-bar-component';
import NoSitesComponent from '../../lib/components/no-sites-component';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const signupInboxId = config.get( 'signupInboxId' );
const host = dataHelper.getJetpackHost();
const locale = driverManager.currentLocale();
const passwordForTestAccounts = config.get( 'passwordForNewTestSignUps' );

let driver;

describe( `[${ host }] Sign Up: Account Only  (${ screenSize }, ${ locale })`, function() {
	this.timeout( mochaTimeOut );

	const userName = dataHelper.getNewBlogName();

	before( async function() {
		driver = await driverManager.startBrowser();
		await driverManager.ensureNotLoggedIn( driver );
	} );

	step( 'Can enter the account flow and see the account details page', async function() {
		await StartPage.Visit(
			driver,
			StartPage.getStartURL( {
				culture: locale,
				flow: 'account',
			} )
		);
		await CreateYourAccountPage.Expect( driver );
	} );

	step( 'Can then enter account details and continue', async function() {
		const emailAddress = dataHelper.getEmailAddress( userName, signupInboxId );
		const createYourAccountPage = await CreateYourAccountPage.Expect( driver );
		return await createYourAccountPage.enterAccountDetailsAndSubmit(
			emailAddress,
			userName,
			passwordForTestAccounts
		);
	} );

	step(
		"Can then see the sign up processing page -  will finish and show a 'Continue' button which is clicked",
		async function() {
			const signupProcessingPage = await SignupProcessingPage.Expect( driver );
			await signupProcessingPage.waitForContinueButtonToBeEnabled();
			return await signupProcessingPage.continueAlong();
		}
	);

	step( 'We are then on the Reader page and have no sites', async function() {
		await ReaderPage.Expect( driver );
		const navBarComponent = await NavBarComponent.Expect( driver );
		await navBarComponent.clickMySites();
		await NoSitesComponent.Expect( driver );
	} );
} );
