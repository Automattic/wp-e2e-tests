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
		const pauseBetweenKeysMS = global.browserName === 'Internet Explorer' ? 1 : 0;

		await driverHelper.setWhenSettable( this.driver, By.id( 'name' ), cardHolder, {
			pauseBetweenKeysMS: pauseBetweenKeysMS,
		} );
		await driverHelper.setWhenSettable( this.driver, By.id( 'number' ), cardNumber, {
			pauseBetweenKeysMS: pauseBetweenKeysMS,
		} );
		await driverHelper.setWhenSettable( this.driver, By.id( 'expiration-date' ), cardExpiry, {
			pauseBetweenKeysMS: pauseBetweenKeysMS,
		} );
		await driverHelper.setWhenSettable( this.driver, By.id( 'cvv' ), cardCVV, {
			pauseBetweenKeysMS: pauseBetweenKeysMS,
		} );
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `div.country select option[value="${ cardCountryCode }"]` )
		);
		return await driverHelper.setWhenSettable( this.driver, By.id( 'postal-code' ), cardPostCode, {
			pauseBetweenKeysMS: pauseBetweenKeysMS,
		} );
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
			.then( products => promise.all( products.map( e => e.getText() ) ) );
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

	async clickCouponButton() {
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( 'button.cart__toggle-link' )
		);

		// 2 elements have this locator on the page including the mobile element
		let elements = await this.driver.findElements( By.css( 'button.cart__toggle-link' ) );
		for ( let i = 0; i < elements.length; i++ ) {
			let element = elements[ i ];
			element.click().then(
				function() {
					return true;
				},
				function() {}
			);
		}
	}

	async toggleCartSummary() {
		// Mobile
		if ( process.env.BROWSERSIZE === 'mobile' ) {
			return await driverHelper.clickWhenClickable(
				this.driver,
				By.css( '.checkout__summary-toggle' )
			);
		}
	}

	async cartTotalAmount() {
		await driverHelper.waitTillPresentAndDisplayed( this.driver, By.css( '.cart-total-amount' ) );
		let cartText = await this.driver.findElement( By.css( '.cart-total-amount' ) ).getText();
		let amountMatches = cartText.match( /\d+\.?\d*/g );
		return await parseFloat( amountMatches[ 0 ] );
	}

	async applyCoupon() {
		return await driverHelper.clickWhenClickable( this.driver, By.css( '#apply-coupon' ) );
	}

	async enterCouponCode( couponCode ) {
		await this.clickCouponButton();
		await driverHelper.setWhenSettable( this.driver, By.css( '#coupon-code' ), couponCode );
		return await this.applyCoupon();
	}

	async removeCoupon() {
		await driverHelper.waitTillPresentAndDisplayed( this.driver, By.css( '.cart__remove-link' ) );
		let elements = await this.driver.findElements( By.css( '.cart__remove-link' ) );
		// 2 of these elements on page
		for ( let i = 0; i < elements.length; i++ ) {
			let element = elements[ i ];
			element.click().then(
				function() {
					return true;
				},
				function() {}
			);
		}
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
