import webdriver from 'selenium-webdriver';
import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';
import SecurePaymentComponent from '../components/secure-payment-component.js';

const by = webdriver.By;
const until = webdriver.until;

export default class PlansPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.current-plan' ) );
	}
	clickComparePlans() {
		let selector = by.css( '.current-plan a[href*=compare]' );
		return driverHelper.clickWhenClickable( this.driver, selector, this.explicitWaitMS );
	}
	waitForComparison() {
		return this.driver.wait( until.elementLocated( by.css( '.plans-compare__table' ) ), this.explicitWaitMS, 'Could not locate the compare plans page' );
	}
	returnFromComparison() {
		let selector = by.css( '.header-cake__back' );
		return driverHelper.clickWhenClickable( this.driver, selector, this.explicitWaitMS );
	}
	purchasePremium() {
		var d = webdriver.promise.defer();

		var testCardHolder = 'End To End Testing';
		var testVisaNumber = '4483910254901646';
		var testVisaExpiry = '02/19';
		var testCVV = '300';
		var testCardCountryCode = 'AU';
		var testCardPostCode = '4000';

		this.driver.findElement( by.css( '.plan.value_bundle button' ) ).click();
		let securePaymentComponent = new SecurePaymentComponent( this.driver );
		securePaymentComponent.enterTestCreditCardDetails( testCardHolder, testVisaNumber, testVisaExpiry, testCVV, testCardCountryCode, testCardPostCode );
		securePaymentComponent.submitPaymentDetails();

		this.driver.wait( until.elementLocated( by.className( 'checkout-thank-you' ) ), this.explicitWaitMS, 'Could not locate the checkout thank you page' );

		d.fulfill( true );
		return d.promise;
	}
}
