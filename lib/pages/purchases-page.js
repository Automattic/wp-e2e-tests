import webdriver from 'selenium-webdriver';

import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

const by = webdriver.By;

export default class PurchasesPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.purchases-list' ) );
	}

	selectDomain( domainName ) {
		return driverHelper.clickWhenClickable( this.driver, by.css( `a.purchase-item[href*="${ domainName }"]` ) );
	}

	waitForSuccessMessage() {
		return driverHelper.waitTillPresentAndDisplayed( this.driver, by.css( '.notice.is-success' ) );
	}

	isEmpty() {
		return driverHelper.isElementPresent( this.driver, by.css( '.empty-content' ) );
	}
}
