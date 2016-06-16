import { By } from 'selenium-webdriver';

import BaseContainer from '../../base-container.js';

import * as driverHelper from '../../driver-helper.js';

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
		}, this.explicitWaitMS * 3, 'The continue button on the sign up processing page is still disabled after waiting for it to become enabled' );
	}

	continueAlong() {
		const self = this;
		return driverHelper.clickWhenClickable( self.driver, self.continueButtonSelector );
	}
}
