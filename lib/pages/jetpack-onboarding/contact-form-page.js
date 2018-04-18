/** @format */

import { By } from 'selenium-webdriver';

import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';

export default class ContactFormPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.jetpack-onboarding' ) );
	}

	selectAddContactForm() {
		return driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.card[data-e2e-type="contact-form"] button' )
		);
	}

	selectContinue() {
		const continueSelector = By.css( '.card[data-e2e-type="continue"] button' );
		return driverHelper
			.waitTillPresentAndDisplayed( this.driver, continueSelector )
			.then( () => driverHelper.clickWhenClickable( this.driver, continueSelector ) );
	}
}
