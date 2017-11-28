import webdriver from 'selenium-webdriver';

import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

const by = webdriver.By;

export default class ManagePurchasePage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.manage-purchase.main' ) );
	}

	domainDisplayed() {
		return this.driver.findElement( by.css( '.manage-purchase__title' ) ).getText();
	}

	chooseCancelDomainAndRefund() {
		return driverHelper.clickWhenClickable( this.driver, by.css( '.manage-purchase a[href$="cancel"]' ) );
	}
}
