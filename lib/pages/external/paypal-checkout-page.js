/** @format */

import { By as by } from 'selenium-webdriver';
import BaseContainer from '../../base-container.js';
import * as driverHelper from '../../driver-helper';

export default class PaypalCheckoutPage extends BaseContainer {
	constructor( driver ) {
		const priceSelector = by.css( '.formatCurrency' );
		super( driver, priceSelector );
		this.priceSelector = priceSelector;
	}

	priceDisplayed() {
		driverHelper.waitTillPresentAndDisplayed( this.driver, this.priceSelector );
		return this.driver.findElement( this.priceSelector ).getText();
	}
}
