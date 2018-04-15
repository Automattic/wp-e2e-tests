/** @format */

import { By as by } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper.js';

import BaseContainer from '../base-container.js';

export default class ShoppingCartWidgetComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, by.className( 'cart-toggle-button' ) );
	}

	async open() {
		const driver = this.driver;
		const explicitWait = this.explicitWaitMS;

		await this.displayedOpen();
		return await driverHelper.clickWhenClickable(
			driver,
			by.css( '.cart-toggle-button' ),
			explicitWait
		);
	}

	async displayedOpen() {
		return await driverHelper.isElementPresent( this.driver, by.css( 'cart-body' ) );
	}

	async removeItem( self ) {
		let cartEmpty = await driverHelper.isElementPresent( this.driver, by.css( '.cart-empty' ) );
		if ( ! cartEmpty ) {
			return await driverHelper.clickWhenClickable( self.driver, by.css( '.cart__remove-item' ) );
		}
	}

	async empty() {
		let self = this;
		const cartBadgeSelector = by.css( '.cart__count-badge' );

		let present = await driverHelper.isElementPresent( self.driver, cartBadgeSelector );
		if ( present ) {
			await self.open();
			let numItems = await self.driver.findElement( cartBadgeSelector ).getText();
			for ( let i = 0; i < numItems; i++ ) {
				await self.removeItem( self );
			}
		}
	}
}
