/** @format */

import webdriver from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper';

const by = webdriver.By;

export default class PlanCheckoutPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.checkout__payment-box-container' ) );
	}

	async clickCouponButton() {
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			by.css( 'button.cart__toggle-link' )
		);

		// 2 elements have this locator on the page including the mobile element
		let elements = await this.driver.findElements( by.css( 'button.cart__toggle-link' ) );
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
		if ( process.env.BROWSERENV === 'mobile' ) {
			return await driverHelper.clickWhenClickable(
				this.driver,
				by.css( '.checkout__summary-toggle' )
			);
		}
	}

	async cartTotalAmount() {
		await driverHelper.waitTillPresentAndDisplayed( this.driver, by.css( '.cart-total-amount' ) );
		let cartText = await this.driver.findElement( by.css( '.cart-total-amount' ) ).getText();
		let amountMatches = cartText.match( /\d+\.?\d*/g );
		return await parseFloat( amountMatches[ 0 ] );
	}

	async applyCoupon() {
		return await driverHelper.clickWhenClickable( this.driver, by.css( '#apply-coupon' ) );
	}

	async enterCouponCode( couponCode ) {
		await this.clickCouponButton();
		await driverHelper.setWhenSettable( this.driver, by.css( '#coupon-code' ), couponCode );
		return await this.applyCoupon();
	}

	async removeCoupon() {
		await driverHelper.waitTillPresentAndDisplayed( this.driver, by.css( '.cart__remove-link' ) );
		let elements = await this.driver.findElements( by.css( '.cart__remove-link' ) );
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

	async removeFromCart() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( 'button.cart__remove-item' )
		);
	}
}
