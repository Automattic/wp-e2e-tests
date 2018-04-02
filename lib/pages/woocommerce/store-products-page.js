/** @format */

import webdriver from 'selenium-webdriver';
import config from 'config';
import BaseContainer from '../../base-container.js';
import * as driverHelper from '../../driver-helper';
import * as dataHelper from '../../data-helper';

const by = webdriver.By;

export default class StoreProductsPage extends BaseContainer {
	constructor( driver, visit = false ) {
		const url =
			dataHelper.configGet( 'calypsoBaseURL' ) +
			'/store/products/' +
			config.get( 'wooCommerceSite' );
		super( driver, by.css( '.products__list' ), visit, url );
	}

	atLeastOneProductDisplayed() {
		return driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			by.css( '.products__list-wrapper tr.has-action' )
		);
	}

	productDisplayed( productTitle ) {
		return driverHelper.isElementPresent(
			this.driver,
			StoreProductsPage._getSelectorForProduct( productTitle )
		);
	}

	selectProduct( productTitle ) {
		return driverHelper.clickWhenClickable(
			this.driver,
			StoreProductsPage._getSelectorForProduct( productTitle )
		);
	}

	static _getSelectorForProduct( productTitle ) {
		return by.xpath( `//span[text()='${ productTitle }']` );
	}
}
