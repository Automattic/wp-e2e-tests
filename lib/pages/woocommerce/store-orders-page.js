import webdriver from 'selenium-webdriver';
import BaseContainer from '../../base-container.js';
import * as driverHelper from '../../../lib/driver-helper';

const by = webdriver.By;

export default class StoreOrdersPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.woocommerce .orders__container' ) );
	}

	atLeastOneOrderDisplayed() {
		return driverHelper.isEventuallyPresentAndDisplayed( this.driver, by.css( '.orders__table .table-row.has-action' ) );
	}
}
