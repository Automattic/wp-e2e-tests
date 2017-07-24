import webdriver from 'selenium-webdriver';
import BaseContainer from '../../base-container.js';

import * as driverHelper from '../../../lib/driver-helper';

const by = webdriver.By;

export default class StoreOrderDetailsPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.woocommerce .order__container' ) );
	}

	clickFirstProduct() {
		return driverHelper.clickWhenClickable( this.driver, by.css( '.woocommerce .order__detail-item-link' ) );
	}
}
