import webdriver from 'selenium-webdriver';
import BaseContainer from '../../base-container.js';
import * as driverHelper from '../../../lib/driver-helper';

const by = webdriver.By;

export default class StoreOrdersPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.woocommerce .orders__container' ) );
		this.firstOrderSelector = by.css( '.orders__table .table-row.has-action' );
	}

	atLeastOneOrderDisplayed() {
		return driverHelper.isEventuallyPresentAndDisplayed( this.driver, this.firstOrderSelector );
	}

	clickFirstOrder() {
		return driverHelper.clickWhenClickable( this.driver, this.firstOrderSelector );
	}
}
