import { By } from 'selenium-webdriver';

import BaseContainer from '../base-container.js';
import * as SlackNotifier from '../slack-notifier.js';
import * as driverHelper from '../driver-helper.js';

export default class SecurePaymentComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.secure-payment-form' ) );
	}
	enterTestCreditCardDetails( testCardHolder, testVisaNumber, testVisaExpiry, testCVV, testCardCountryCode, testCardPostCode ) {
		driverHelper.setWhenSettable( this.driver, By.id( 'name' ), testCardHolder );
		driverHelper.waitForFieldClearable( this.driver, By.id( 'number' ) );
		this.driver.findElement( By.id( 'number' ) ).sendKeys( testVisaNumber );
		driverHelper.setWhenSettable( this.driver, By.id( 'expiration-date' ), testVisaExpiry );
		driverHelper.setWhenSettable( this.driver, By.id( 'cvv' ), testCVV );
		driverHelper.clickWhenClickable( this.driver, By.css( 'div.country select' ) );
		driverHelper.clickWhenClickable( this.driver, By.css( `div.country select option[value="${testCardCountryCode}"]` ) );
		return driverHelper.setWhenSettable( this.driver, By.id( 'postal-code' ), testCardPostCode );
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
		const driver = this.driver;
		const expectedElementSelector = this.expectedElementSelector;
		const explicitWaitMS = this.explicitWaitMS;
		const self = this;
		return driver.wait( function() {
			return driver.isElementPresent( expectedElementSelector ).then( function( present ) {
				return ! present;
			}, function() {
				return false;
			} );
		}, explicitWaitMS * 2 ).then( function() { }, function( error ) {
			let errorShown = '';
			driver.findElement( By.css( '.notice.is-error' ) ).then( ( element ) => {
				errorShown = element.getText();
			}, ( e ) => {
				errorShown = error + e;
			} );

			SlackNotifier.warn( `Found issue on payment details page: '${errorShown}' - Submitting payment details again now.` );

			self.submitPaymentDetails();
			return driver.wait( function() {
				return driver.isElementPresent( expectedElementSelector ).then( function( present ) {
					return ! present;
				}, function() {
					return false;
				} );
			}, explicitWaitMS * 2, 'The Secure Payment Component is still visible when it shouldn\'t be' );
		} );
	}
}
