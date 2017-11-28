import webdriver from 'selenium-webdriver';

import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

const by = webdriver.By;

export default class PurchasesPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.purchases-list' ) );
		this._waitForPurchases();
	}

	selectDomain( domainName ) {
		this._waitForPurchases();
		return driverHelper.clickWhenClickable( this.driver, by.css( `a.purchase-item[href*="${ domainName }"]` ) );
	}

	selectDomainInPlan() {
		this._waitForPurchases();
		return driverHelper.clickWhenClickable( this.driver, by.css( 'a.purchase-item .gridicons-domains' ) );
	}

	selectBusinessPlan() {
		this._waitForPurchases();
		return driverHelper.clickWhenClickable( this.driver, by.css( 'a.purchase-item img.is-business-plan' ) );
	}

	waitForAndDismissSuccessMessage() {
		driverHelper.waitTillPresentAndDisplayed( this.driver, by.css( '.notice.is-success' ) );
		return driverHelper.clickWhenClickable( this.driver, by.css( '.notice.is-success .notice__dismiss' ) );
	}

	isEmpty() {
		return driverHelper.isElementPresent( this.driver, by.css( '.empty-content' ) );
	}

	_waitForPurchases() {
		driverHelper.waitTillNotPresent( this.driver, by.css( '.is-placeholder' ) );
	}
}
