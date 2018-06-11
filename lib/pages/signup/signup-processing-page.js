/** @format */

import { By } from 'selenium-webdriver';

import AsyncBaseContainer from '../../async-base-container';

import * as driverHelper from '../../driver-helper';
import * as slackNotifier from '../../slack-notifier';

export default class SignupProcessingPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, SignupProcessingPage._processingSelector() );
		this.continueButtonSelector = By.css( 'button.email-confirmation__button' );
	}

	async waitForContinueButtonToBeEnabled() {
		const self = this;

		return await self.driver
			.wait( function() {
				return self.driver
					.findElement( self.continueButtonSelector )
					.getAttribute( 'disabled' )
					.then( d => {
						return d !== 'true';
					} );
			}, this.explicitWaitMS * 2 )
			.then(
				() => {
					return true;
				},
				async () => {
					slackNotifier.warn(
						'The continue button on the sign up processing page is still disabled after waiting for it to become enabled, refreshing the page to see whether this fixes the issue'
					);
					return await self.driver.navigate().refresh();
				}
			);
	}

	async continueAlong() {
		const self = this;
		await driverHelper.clickWhenClickable( self.driver, self.continueButtonSelector );
		return await driverHelper.waitTillNotPresent( self.driver, self.continueButtonSelector ).then(
			() => {
				return true;
			},
			async () => {
				slackNotifier.warn(
					'The signup processing page is still shown after continuing, trying to click continue again'
				);
				return await driverHelper.clickWhenClickable( self.driver, self.continueButtonSelector );
			}
		);
	}

	async waitToDisappear() {
		const self = this;

		return await self.driver
			.wait( () => {
				return driverHelper
					.isElementPresent( self.driver, self.expectedElementSelector )
					.then( present => {
						return ! present;
					} );
			}, this.explicitWaitMS * 2 )
			.then(
				() => {
					return true;
				},
				async () => {
					slackNotifier.warn(
						'The Signup Processing Page is still present when it should have automatically disappeared, trying a refresh'
					);
					return await self.driver.navigate().refresh();
				}
			);
	}

	static async hideFloatiesinIE11( driver ) {
		const floatiesStringSelector = '.signup-processing-screen__floaties';

		await driverHelper.waitTillPresentAndDisplayed(
			driver,
			SignupProcessingPage._processingSelector
		);

		// Hides the floating background on signup that causes issues with Selenium/SauceLabs getting page loaded status
		if ( global.browserName === 'Internet Explorer' ) {
			driver.executeScript(
				'document.querySelector( "' + floatiesStringSelector + '" ).style.display = "none";'
			);
		}
	}

	static async _processingSelector() {
		return By.css( '.signup-processing__content' );
	}
}
