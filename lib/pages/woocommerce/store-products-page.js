/** @format */

import webdriver from 'selenium-webdriver';
import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper';

const by = webdriver.By;

export default class StoreProductsPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.products__list' ) );
	}

	async atLeastOneProductDisplayed() {
		return driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			by.css( '.products__list-wrapper tr.has-action' )
		);
	}

	async productDisplayed( productTitle ) {
		return await driverHelper.isElementPresent(
			this.driver,
			StoreProductsPage._getSelectorForProduct( productTitle )
		);
	}

	async selectProduct( productTitle ) {
		return await driverHelper.clickWhenClickable(
			this.driver,
			StoreProductsPage._getSelectorForProduct( productTitle )
		);
	}

	static _getSelectorForProduct( productTitle ) {
		return by.css( `.products__list-name[data-e2e-product="${ productTitle }"]` );
	}
}
