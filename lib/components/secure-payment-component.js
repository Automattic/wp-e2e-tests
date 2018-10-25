/** @format */

import { By, promise } from 'selenium-webdriver';

import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper.js';

export default class SecurePaymentComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.secure-payment-form' ) );
		this.paymentButtonSelector = By.css(
			'.credit-card-payment-box button.is-primary:not([disabled])'
		);
		this.personalPlanSlug = 'personal-bundle';
		this.premiumPlanSlug = 'value_bundle';
		this.businessPlanSlug = 'business-bundle';
		this.dotLiveDomainSlug = 'dotlive_domain';
		this.privateWhoisSlug = 'private_whois';
	}

	async _postInit() {
		await this.driver.sleep( 5000 ); // This is to wait for products to settle down during sign up see - https://github.com/Automattic/wp-calypso/issues/24579
	}

	async enterTestCreditCardDetails( {
		cardHolder,
		cardNumber,
		cardExpiry,
		cardCVV,
		cardCountryCode,
		cardPostCode,
	} ) {
		// This PR introduced an issue with older browsers, specifically IE11:
		//   https://github.com/Automattic/wp-calypso/pull/22239

		await driverHelper.setWhenSettable( this.driver, By.id( 'name' ), cardHolder );
		await driverHelper.setWhenSettable( this.driver, By.id( 'number' ), cardNumber );
		await driverHelper.setWhenSettable( this.driver, By.id( 'expiration-date' ), cardExpiry );
		await driverHelper.setWhenSettable( this.driver, By.id( 'cvv' ), cardCVV );
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `div.country select option[value="${ cardCountryCode }"]` )
		);
		return await driverHelper.setWhenSettable( this.driver, By.id( 'postal-code' ), cardPostCode );
	}

	async submitPaymentDetails() {
		const disabledPaymentButton = By.css( '.credit-card-payment-box button[disabled]' );

		await driverHelper.waitTillNotPresent( this.driver, disabledPaymentButton );
		return await driverHelper.clickWhenClickable( this.driver, this.paymentButtonSelector );
	}

	async waitForCreditCardPaymentProcessing() {
		return await driverHelper.waitTillNotPresent(
			this.driver,
			By.css( '.credit-card-payment-box__progress-bar' ),
			this.explicitWaitMS * 5
		);
	}

	async waitForPageToDisappear() {
		return await driverHelper.waitTillNotPresent(
			this.driver,
			this.expectedElementSelector,
			this.explicitWaitMS * 5
		);
	}

	async getProductsNames() {
		const selector = By.css( '.product-name' );
		return await this.driver
			.findElements( selector )
			.then( products => promise.fullyResolved( products.map( e => e.getText() ) ) );
	}

	async numberOfProductsInCart() {
		let elements = await this.driver.findElements( By.css( '.product-name' ) );
		return elements.length;
	}

	async containsPersonalPlan() {
		return this._cartContainsProduct( this.personalPlanSlug );
	}

	async containsPremiumPlan() {
		return await this._cartContainsProduct( this.premiumPlanSlug );
	}

	async containsBusinessPlan() {
		return await this._cartContainsProduct( this.businessPlanSlug );
	}

	async containsDotLiveDomain() {
		return await this._cartContainsProduct( this.dotLiveDomainSlug );
	}

	async containsPrivateWhois() {
		return await this._cartContainsProduct( this.privateWhoisSlug );
	}

	async payWithStoredCardIfPossible( cardCredentials ) {
		const storedCardSelector = By.css( '.stored-card' );
		if ( await driverHelper.isEventuallyPresentAndDisplayed( this.driver, storedCardSelector ) ) {
			await driverHelper.clickWhenClickable( this.driver, storedCardSelector );
		} else {
			await this.enterTestCreditCardDetails( cardCredentials );
		}

		return await this.submitPaymentDetails();
	}

	async cartTotalDisplayed() {
		const selector = By.css( '.cart-total-amount' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, selector );
		return await this.driver.findElement( selector ).getText();
	}

	async paymentButtonText() {
		await driverHelper.waitTillPresentAndDisplayed( this.driver, this.paymentButtonSelector );
		return await this.driver.findElement( this.paymentButtonSelector ).getText();
	}

	async _cartContainsProduct( productSlug, expectedQuantity = 1 ) {
		await driverHelper.waitTillPresentAndDisplayed( this.driver, By.css( '.product-name' ) );
		let elements = await this.driver.findElements(
			By.css( `.product-name[data-e2e-product-slug="${ productSlug }"]` )
		);
		return elements.length === expectedQuantity;
	}
}
