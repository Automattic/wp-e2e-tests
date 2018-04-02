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
		const driver = this.driver;
		const explicitWait = this.explicitWait;

		this.displayedOpen().then(
			function cartAlreadyOpen() {
				d.fulfill( true );
			},
			function cartClosed() {
				driverHelper
					.clickWhenClickable( driver, by.css( '.cart-toggle-button' ), explicitWait )
					.then(
						function success() {
							d.fulfill( true );
						},
						function failure() {
							d.reject( 'Unable to find Shopping Cart Widget button' );
						}
					);
			}
		);

		return d.promise;
	}

	displayedOpen() {
		let d = webdriver.promise.defer();

		driverHelper.isElementPresent( this.driver, by.css( 'cart-body' ) ).then(
			function( present ) {
				if ( present ) {
					d.fulfill( true );
				} else {
					d.reject( 'Cart not open' );
				}
			},
			function() {
				d.reject( 'Cart not open' );
			}
		);

		return d.promise;
	}

	removeItem( self ) {
		let d = webdriver.promise.defer();

		driverHelper
			.isElementPresent( this.driver, by.css( '.cart-empty' ) )
			.then( function( cartEmpty ) {
				if ( ! cartEmpty ) {
					driverHelper.clickWhenClickable( self.driver, by.css( '.cart__remove-item' ) );
				}
			} );

		return d.promise;
	}

	empty() {
		let d = webdriver.promise.defer();
		let self = this;
		const cartBadgeSelector = by.css( '.cart__count-badge' );

		driverHelper.isElementPresent( this.driver, cartBadgeSelector ).then( function( present ) {
			if ( present ) {
				self.open().then( function() {
					self.driver
						.findElement( cartBadgeSelector )
						.getText()
						.then( function( numItems ) {
							let flow = self.driver.controlFlow();
							let promiseArray = [];
							for ( let i = 0; i < numItems; i++ ) {
								promiseArray.push(
									flow.execute( function() {
										self.removeItem( self );
									} )
								);
							}
							webdriver.promise.all( promiseArray ).then( function() {
								d.fulfill( true );
							} );
						} );
				} );
			} else {
				d.fulfill( true );
			}
		} );

		return d.promise;
	}
}
