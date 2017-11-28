import webdriver from 'selenium-webdriver';

import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

const by = webdriver.By;

export default class CancelPurchasePage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.cancel-purchase.main' ) );
		this.cancelButtonSelector = by.css( 'button.cancel-purchase__button' );
	}

	clickCancelPurchase() {
		return driverHelper.clickWhenClickable( this.driver, this.cancelButtonSelector );
	}
}
