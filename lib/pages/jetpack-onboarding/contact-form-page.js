/** @format */

import { By } from 'selenium-webdriver';

import AsyncBaseContainer from '../../async-base-container';

import * as driverHelper from '../../driver-helper';

export default class ContactFormPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.jetpack-onboarding' ) );
	}

	async selectAddContactForm() {
		// Button is not ready right away causing not expected redirects for some tests
		await this.driver.sleep( 1000 );
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.card[data-e2e-type="contact-form"] button' )
		);
	}

	async selectContinue() {
		const continueSelector = By.css( '.card[data-e2e-type="continue"] button' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, continueSelector );
		return await driverHelper.clickWhenClickable( this.driver, continueSelector );
	}
}
