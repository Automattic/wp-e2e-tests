/** @format */

import { By as by, until } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper.js';

import BaseContainer from '../base-container.js';

export default class PaymentButtonFrontEndComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.jetpack-simple-payments-wrapper' ) );
	}

	async clickPaymentButton() {
		const payPalPayButtonSelector = by.css( '.paypal-button' );
		this.driver.wait(
			until.ableToSwitchToFrame( by.css( '.xcomponent-component-frame' ) ),
			this.explicitWaitMS,
			'Could not locate the payment button iFrame.'
		);
		driverHelper.waitTillPresentAndDisplayed( this.driver, payPalPayButtonSelector );
		driverHelper.clickWhenClickable( this.driver, payPalPayButtonSelector );
		return this.driver.switchTo().defaultContent();
	}
}
