import { By } from 'selenium-webdriver';

import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';
import * as slackNotifier from '../../slack-notifier';

export default class SignupProcessingPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.signup-processing__content' ) );
		this.continueButtonSelector = By.css( 'button.email-confirmation__button' );
	}

	waitForContinueButtonToBeEnabled() {
		const self = this;

		return self.driver.wait( function() {
			return self.driver.findElement( self.continueButtonSelector ).getAttribute( 'disabled' ).then( ( d ) => {
				return d !== 'true';
			} );
		}, this.explicitWaitMS * 2, 'The continue button on the sign up processing page is still disabled after waiting for it to become enabled' );
	}

	continueAlong() {
		const self = this;
		driverHelper.clickWhenClickable( self.driver, self.continueButtonSelector );
		return self.driver.wait( () => {
			return self.driver.isElementPresent( self.expectedElementSelector ).then( ( present ) => {
				return !present;
			} );
		}, this.explicitWaitMS * 2 ).then( () => {
			return true;
		}, () => {
			slackNotifier.warn( 'The signup processing page is still shown after continuing, trying to click continue again' );
			return driverHelper.clickWhenClickable( self.driver, self.continueButtonSelector );
		} );
	}

	waitToDisappear() {
		const self = this;

		return self.driver.wait( () => {
			return self.driver.isElementPresent( self.expectedElementSelector ).then( ( present ) => {
				return !present;
			} );
		}, this.explicitWaitMS * 2, 'The Signup Processing Page is still present when it should have automatically disappeared' );
	}
}
