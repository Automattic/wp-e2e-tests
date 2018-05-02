/** @format */

import { By, until, promise } from 'selenium-webdriver';

import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

export default class SecurePaymentComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.secure-payment-form' ) );
		this.paymentButtonSelector = By.css( '.credit-card-payment-box button.is-primary' );
	}

	enterTestCreditCardDetails( {
		cardHolder,
		cardNumber,
		cardExpiry,
		cardCVV,
		cardCountryCode,
		cardPostCode,
	} ) {
		// This PR introduced an issue with older browsers, specifically IE11:
		//   https://github.com/Automattic/wp-calypso/pull/22239
		const pauseBetweenKeysMS = global.browserName === 'Internet Explorer' ? 1 : 0;

		driverHelper.setWhenSettable( this.driver, By.id( 'name' ), cardHolder, {
			pauseBetweenKeysMS: pauseBetweenKeysMS,
		} );
		driverHelper.setWhenSettable( this.driver, By.id( 'number' ), cardNumber, {
			pauseBetweenKeysMS: pauseBetweenKeysMS,
		} );
		driverHelper.setWhenSettable( this.driver, By.id( 'expiration-date' ), cardExpiry, {
			pauseBetweenKeysMS: pauseBetweenKeysMS,
		} );
		driverHelper.setWhenSettable( this.driver, By.id( 'cvv' ), cardCVV, {
			pauseBetweenKeysMS: pauseBetweenKeysMS,
		} );
		driverHelper.clickWhenClickable(
			this.driver,
			By.css( `div.country select option[value="${ cardCountryCode }"]` )
		);
		return driverHelper.setWhenSettable( this.driver, By.id( 'postal-code' ), cardPostCode, {
			pauseBetweenKeysMS: pauseBetweenKeysMS,
		} );
	}

	submitPaymentDetails() {
		const disabledPaymentButton = By.css( '.credit-card-payment-box button[disabled]' );

		return driverHelper
			.waitTillNotPresent( this.driver, disabledPaymentButton )
			.then( () => driverHelper.clickWhenClickable( this.driver, this.paymentButtonSelector ) );
	}

	removePlanAndDomain() {
		const removeItemSelector = By.css( 'button.remove-item' );
		driverHelper.clickWhenClickable( this.driver, removeItemSelector );
		return driverHelper.clickWhenClickable( this.driver, removeItemSelector );
	}

	waitForCreditCardPaymentProcessing() {
		return driverHelper.waitTillNotPresent(
			this.driver,
			By.css( '.credit-card-payment-box__progress-bar' ),
			this.explicitWaitMS * 5
		);
	}

	waitForPageToDisappear() {
		return driverHelper.waitTillNotPresent(
			this.driver,
			this.expectedElementSelector,
			this.explicitWaitMS * 5
		);
	}

	payTotalButton() {
		const selector = By.css( '.credit-card-payment-box button.pay-button__button' );
		this.driver.wait(
			until.elementLocated( selector ),
			this.explicitWaitMS,
			'Could not locate the business plan price element'
		);
		return this.driver.findElement( selector ).getText();
	}

	getProductsNames() {
		const selector = By.css( '.product-name' );
		return this.driver
			.findElements( selector )
			.then( products => promise.all( products.map( e => e.getText() ) ) );
	}

	numberOfProductsInCart() {
		return this.driver.findElements( By.css( '.product-name' ) ).then( elements => {
			return elements.length;
		} );
	}

	cartContainsProduct( productSlug, expectedQuantity = 1 ) {
		return this.driver
			.findElements( By.css( `.product-name[data-e2e-product-slug="${ productSlug }"]` ) )
			.then( elements => {
				return elements.length === expectedQuantity;
			} );
	}

	payWithStoredCardIfPossible( cardCredentials ) {
		const storedCardSelector = By.css( '.stored-card' );
		if ( driverHelper.isEventuallyPresentAndDisplayed( this.driver, storedCardSelector ) ) {
			driverHelper.clickWhenClickable( this.driver, storedCardSelector );
		} else {
			this.enterTestCreditCardDetails( cardCredentials );
		}

		return this.submitPaymentDetails();
	}

	cartTotalDisplayed() {
		return this.driver.findElement( By.css( '.cart-total-amount' ) ).getText();
	}

	paymentButtonText() {
		return this.driver.findElement( this.paymentButtonSelector ).getText();
	}
}
