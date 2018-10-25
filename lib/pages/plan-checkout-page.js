/** @format */

import webdriver, { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper';
import { currentScreenSize } from '../driver-manager';

const by = webdriver.By;

export default class PlanCheckoutPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.checkout__payment-box-container' ) );
	}

	async clickCouponButton() {
		// If we're on desktop
		if ( currentScreenSize() === 'desktop' ) {
			return await driverHelper.clickWhenClickable(
				this.driver,
				By.css( '.cart__coupon button.cart__toggle-link' )
			);
		}

		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.payment-box__content .cart__coupon button.cart__toggle-link' )
		);
	}

	async toggleCartSummary() {
		// Mobile
		if ( currentScreenSize() === 'mobile' ) {
			return await driverHelper.clickWhenClickable(
				this.driver,
				by.css( '.checkout__summary-toggle' )
			);
		}
	}

	async cartTotalAmount() {
		let cartElement = await this.driver.findElement( By.css( '.cart-total-amount' ) );

		if ( currentScreenSize() === 'mobile' ) {
			await this.driver.executeScript( 'arguments[0].scrollIntoView()', cartElement );
		}

		await driverHelper.waitTillPresentAndDisplayed( this.driver, By.css( '.cart-total-amount' ) );
		let cartText = await cartElement.getText();
		let amountMatches = cartText.match( /\d+\.?\d*/g );
		return await parseFloat( amountMatches[ 0 ] );
	}

	async applyCoupon() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( 'button[data-e2e-type="apply-coupon"]' )
		);
	}

	async enterCouponCode( couponCode ) {
		await this.clickCouponButton();
		await driverHelper.setWhenSettable(
			this.driver,
			by.css( 'input[data-e2e-type="coupon-code"]' ),
			couponCode
		);
		return await this.applyCoupon();
	}

	async removeCoupon() {
		// Desktop
		if ( currentScreenSize() === 'desktop' ) {
			await driverHelper.waitTillPresentAndDisplayed( this.driver, By.css( '.cart__remove-link' ) );

			return await driverHelper.clickWhenClickable( this.driver, By.css( '.cart__remove-link' ) );
		}

		// Mobile
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.payment-box__content .cart__remove-link' )
		);

		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.payment-box__content .cart__remove-link' )
		);
	}

	async removeFromCart() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( 'button.cart__remove-item' )
		);
	}
}
