import { By, until } from 'selenium-webdriver';

import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

export default class SecurePaymentComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.secure-payment-form' ) );
	}

	enterTestCreditCardDetails( { cardHolder, cardNumber, cardExpiry, cardCVV, cardCountryCode, cardPostCode } ) {
		driverHelper.setWhenSettable( this.driver, By.id( 'name' ), cardHolder );
		driverHelper.waitForFieldClearable( this.driver, By.id( 'number' ) );
		this.driver.findElement( By.id( 'number' ) ).sendKeys( cardNumber );
		driverHelper.setWhenSettable( this.driver, By.id( 'expiration-date' ), cardExpiry );
		driverHelper.setWhenSettable( this.driver, By.id( 'cvv' ), cardCVV );
		driverHelper.clickWhenClickable( this.driver, By.css( `div.country select option[value="${cardCountryCode}"]` ) );
		return driverHelper.setWhenSettable( this.driver, By.id( 'postal-code' ), cardPostCode );
	}

	submitPaymentDetails() {
		return driverHelper.clickWhenClickable( this.driver, By.css( '.credit-card-payment-box button.is-primary' ) );
	}

	removePlanAndDomain() {
		const removeItemSelector = By.css( 'button.remove-item' );
		driverHelper.clickWhenClickable( this.driver, removeItemSelector );
		return driverHelper.clickWhenClickable( this.driver, removeItemSelector );
	}

	waitForPageToDisappear() {
		const self = this;
		return self.driver.wait( function() {
			return driverHelper.isElementPresent( self.driver, self.expectedElementSelector ).then( function( present ) {
				return ! present;
			}, function() {
				return false;
			} );
		}, self.explicitWaitMS * 3, 'The Secure Payment Component is still visible when it shouldn\'t be' );
	}

	payTotalButton() {
		const selector = By.css( '.credit-card-payment-box button.pay-button__button' );
		this.driver.wait( until.elementLocated( selector ), this.explicitWaitMS, 'Could not locate the business plan price element' );
		return this.driver.findElement( selector ).getText();
	}
}
