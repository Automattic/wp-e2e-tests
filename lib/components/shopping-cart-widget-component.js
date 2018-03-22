/** @format */

import webdriver, { By as by } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper.js';

import BaseContainer from '../base-container.js';

export default class ShoppingCartWidgetComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, by.className( 'cart-toggle-button' ) );
	}

	open() {
		let d = webdriver.promise.defer();

		this.displayedOpen().then(
			() => d.fulfill( true ),
			() =>
				driverHelper
					.clickWhenClickable( this.driver, by.css( '.cart-toggle-button' ) )
					.then(
						() => d.fulfill( true ),
						() => d.reject( 'Unable to find Shopping Cart Widget button' )
					)
		);

		return d.promise;
	}

	displayedOpen() {
		let d = webdriver.promise.defer();

		driverHelper.isElementPresent( this.driver, by.css( 'cart-body' ) ).then(
			present => {
				if ( present ) {
					d.fulfill( true );
				} else {
					d.reject( 'Cart not open' );
				}
			},
			() => d.reject( 'Cart not open' )
		);

		return d.promise;
	}

	removeItem( self ) {
		let d = webdriver.promise.defer();

		driverHelper.isElementPresent( this.driver, by.css( '.cart-empty' ) ).then( cartEmpty => {
			if ( ! cartEmpty ) {
				driverHelper.clickWhenClickable( self.driver, by.css( '.cart__remove-item' ) );
			}
		} );

		return d.promise;
	}

	empty() {
		let d = webdriver.promise.defer();
		const cartBadgeSelector = by.css( '.cart__count-badge' );

		driverHelper.isElementPresent( this.driver, cartBadgeSelector ).then( present => {
			if ( present ) {
				this.open().then( () => {
					this.driver
						.findElement( cartBadgeSelector )
						.getText()
						.then( numItems => {
							let flow = this.driver.controlFlow();
							let promiseArray = [];
							for ( let i = 0; i < numItems; i++ ) {
								promiseArray.push(
									flow.execute( () => {
										this.removeItem( this );
									} )
								);
							}
							webdriver.promise.all( promiseArray ).then( () => d.fulfill( true ) );
						} );
				} );
			} else {
				d.fulfill( true );
			}
		} );

		return d.promise;
	}
}
