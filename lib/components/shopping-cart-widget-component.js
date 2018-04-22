/** @format */

import { By as by } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper.js';

import BaseContainer from '../base-container.js';

export default class ShoppingCartWidgetComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, by.className( 'cart-toggle-button' ) );
	}

	open() {
		const driver = this.driver;
		const explicitWait = this.explicitWaitMS;

		if ( ! this.displayedOpen() ) {
			return driverHelper.clickWhenClickable(
				driver,
				by.css( '.cart-toggle-button' ),
				explicitWait
			);
		}
	}

	displayedOpen() {
		return driverHelper.isElementPresent( this.driver, by.css( 'cart-body' ) );
	}

	removeItem( self ) {
		let cartEmpty = driverHelper.isElementPresent( this.driver, by.css( '.cart-empty' ) );
		if ( ! cartEmpty ) {
			return driverHelper.clickWhenClickable( self.driver, by.css( '.cart__remove-item' ) );
		}
	}

	empty() {
		let self = this;
		const cartBadgeSelector = by.css( '.cart__count-badge' );

		let present = driverHelper.isElementPresent( self.driver, cartBadgeSelector );
		if ( present ) {
			self.open();
			let numItems = self.driver.findElement( cartBadgeSelector ).getText();
			for ( let i = 0; i < numItems; i++ ) {
				self.removeItem( self );
			}
		}
	}
}
