/** @format */

import { By } from 'selenium-webdriver';

import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';
import * as slackNotifier from '../../slack-notifier';

export default class SignupProcessingPage extends BaseContainer {
	constructor( driver ) {
		const floatiesStringSelector = '.signup-processing-screen__floaties';
		const processingSelector = By.css( '.signup-processing__content' );
		driverHelper.waitTillPresentAndDisplayed( driver, processingSelector );

		// Hides the floating background on signup that causes issues with Selenium/SauceLabs getting page loaded status
		if ( global.browserName === 'Internet Explorer' ) {
			driver.executeScript(
				'document.querySelector( "' + floatiesStringSelector + '" ).style.display = "none";'
			);
		}
		super( driver, processingSelector );
		this.continueButtonSelector = By.css( 'button.email-confirmation__button' );
	}

	waitForContinueButtonToBeEnabled() {
		const self = this;

		return self.driver
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
				() => {
					slackNotifier.warn(
						'The continue button on the sign up processing page is still disabled after waiting for it to become enabled, refreshing the page to see whether this fixes the issue'
					);
					return self.driver.navigate().refresh();
				}
			);
	}

	continueAlong() {
		const self = this;
		driverHelper.clickWhenClickable( self.driver, self.continueButtonSelector );
		return driverHelper.waitTillNotPresent( self.driver, self.continueButtonSelector ).then(
			() => {
				return true;
			},
			() => {
				slackNotifier.warn(
					'The signup processing page is still shown after continuing, trying to click continue again'
				);
				return driverHelper.clickWhenClickable( self.driver, self.continueButtonSelector );
			}
		);
	}

	waitToDisappear() {
		const self = this;

		return self.driver
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
				() => {
					slackNotifier.warn(
						'The Signup Processing Page is still present when it should have automatically disappeared, trying a refresh'
					);
					return self.driver.navigate().refresh();
				}
			);
	}
}
