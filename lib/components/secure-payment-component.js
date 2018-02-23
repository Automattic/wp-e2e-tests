import { By, until, promise } from 'selenium-webdriver';

import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

export default class SecurePaymentComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.secure-payment-form' ) );
	}

	enterTestCreditCardDetails( { cardHolder, cardNumber, cardExpiry, cardCVV, cardCountryCode, cardPostCode } ) {
		// This PR introduced an issue with older browsers, specifically IE11:
		//   https://github.com/Automattic/wp-calypso/pull/22239
		const pauseBetweenKeysMS = global.browserName === 'Internet Explorer' ? 1 : 0;

		driverHelper.setWhenSettable( this.driver, By.id( 'name' ), cardHolder, { pauseBetweenKeysMS: pauseBetweenKeysMS } );

		// But why?...
		driverHelper.waitForFieldClearable( this.driver, By.id( 'number' ) );
		this.driver.findElement( By.id( 'number' ) ).sendKeys( cardNumber );

		driverHelper.setWhenSettable( this.driver, By.id( 'expiration-date' ), cardExpiry, { pauseBetweenKeysMS: pauseBetweenKeysMS } );
		driverHelper.setWhenSettable( this.driver, By.id( 'cvv' ), cardCVV, { pauseBetweenKeysMS: pauseBetweenKeysMS } );
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

	waitForCreditCardPaymentProcessing() {
		return driverHelper.waitTillNotPresent( this.driver, By.css( '.credit-card-payment-box__progress-bar' ), this.explicitWaitMS * 5 );
	}

	waitForPageToDisappear() {
		return driverHelper.waitTillNotPresent( this.driver, this.expectedElementSelector, this.explicitWaitMS * 5 );
	}

	payTotalButton() {
		const selector = By.css( '.credit-card-payment-box button.pay-button__button' );
		this.driver.wait( until.elementLocated( selector ), this.explicitWaitMS, 'Could not locate the business plan price element' );
		return this.driver.findElement( selector ).getText();
	}

	getProductsNames() {
		const selector = By.css( '.product-name' );
		return this.driver.findElements( selector ).then( products =>
			promise.all( products.map( e => e.getText() ) )
		);
	}
}
