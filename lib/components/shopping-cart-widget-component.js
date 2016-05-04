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

		this.displayed().then( function cartAlreadyOpen() {
			d.fulfill( true );
		}, function cartClosed() {
			driverHelper.clickWhenClickable( driver, by.className( 'cart-toggle-button' ), explicitWait ).then(
			function success() {
				d.fulfill( true );
			}, function failure() {
				d.reject( 'Unable to find Shopping Cart Widget button' );
			} );
		} );

		return d.promise;
	}

	displayed() {
		var d = webdriver.promise.defer();

		this.driver.isElementPresent( by.className( 'cart-body' ) ).then( function( present ) {
			if ( present ) {
				d.fulfill( true );
			} else {
				d.reject( 'Cart not open' );
			}
		}, function() {
			d.reject( 'Cart not open' );
		} );

		return d.promise;
	}

	removeItem( self ) {
		var d = webdriver.promise.defer();

		this.driver.isElementPresent( by.className( 'cart-empty' ) ).then( function( cartEmpty ) {
			if ( ! cartEmpty ) {
				driverHelper.clickWhenClickable( self.driver, by.css( '.cart-item .remove-item' ), self.explicitWait );
			}
		} );

		return d.promise;
	}

	empty() {
		var d = webdriver.promise.defer();
		var self = this;

		this.driver.isElementPresent( by.className( 'popover-cart__count-badge' ) ).then( function( present ) {
			if ( present ) {
				self.open().then( function() {
					self.driver.findElement( webdriver.By.className( 'popover-cart__count-badge' ) ).getText().then( function( numItems ) {
						var flow = self.driver.controlFlow();
						var promiseArray = [];
						for ( let i = 0; i < numItems; i++ ) {
							promiseArray.push( flow.execute( function() {
								self.removeItem( self );
							} ) );
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
