/** @format */

import { By } from 'selenium-webdriver';

import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';
import * as slackNotifier from '../../slack-notifier';

export default class SignupProcessingPage extends BaseContainer {
	constructor( driver ) {
		// Hides the floating background on signup that causes issues with Selenium/SauceLabs getting page loaded status
		if ( global.browserName === 'Internet Explorer' ) {
			driver.executeScript(
				'document.querySelector( ".signup-processing-screen__floaties" ).style.display = "none"'
			);
		}

		super( driver, By.css( '.signup-processing__content' ) );
		this.continueButtonSelector = By.css( 'button.email-confirmation__button' );
	}

	waitForContinueButtonToBeEnabled() {
		return this.driver
			.wait( () => this.driver
			.findElement( this.continueButtonSelector )
			.getAttribute( 'disabled' )
			.then( d => d !== 'true' )
		, this.explicitWaitMS * 2 )
			.then(
				() => true,
				() => {
					slackNotifier.warn(
						'The continue button on the sign up processing page is still disabled after waiting for it to become enabled, refreshing the page to see whether this fixes the issue'
					);
					return this.driver.navigate().refresh();
				}
			);
	}

	continueAlong() {
		driverHelper.clickWhenClickable( this.driver, this.continueButtonSelector );
		return driverHelper.waitTillNotPresent( this.driver, this.continueButtonSelector ).then(
			() => true,
			() => {
				slackNotifier.warn(
					'The signup processing page is still shown after continuing, trying to click continue again'
				);
				return driverHelper.clickWhenClickable( this.driver, this.continueButtonSelector );
			}
		);
	}

	waitToDisappear() {
		return driverHelper.waitTillPresentAndDisplayed( this.driver, this.expectedElementSelector, this.explicitWaitMS * 2 )
		.then(
			() => true,
			() => {
				slackNotifier.warn(
					'The Signup Processing Page is still present when it should have automatically disappeared, trying a refresh'
				);
				return this.driver.navigate().refresh();
			}
		);
	}
}
