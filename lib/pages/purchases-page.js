/** @format */

import webdriver from 'selenium-webdriver';

import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

const by = webdriver.By;

export default class PurchasesPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( 'a[href="/me/purchases"][aria-selected="true"]' ) );
		this._waitForPurchases();
	}

	selectDomain( domainName ) {
		this._waitForPurchases();
		return driverHelper.clickWhenClickable(
			this.driver,
			by.css( `a.purchase-item[href*="${ domainName }"]` )
		);
	}

	selectDomainInPlan() {
		this._waitForPurchases();
		return driverHelper.clickWhenClickable(
			this.driver,
			by.css( 'a.purchase-item .gridicons-domains' )
		);
	}

	async selectBusinessPlan() {
		await this._waitForPurchases();
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( 'a.purchase-item img.is-business-plan' )
		);
	}

	waitForAndDismissSuccessMessage() {
		driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			by.css( '.notice.is-success' ),
			this.explicitWaitMS * 2
		);
		return driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.notice.is-success .notice__dismiss' )
		);
	}

	isEmpty() {
		return driverHelper.isElementPresent( this.driver, by.css( '.empty-content' ) );
	}

	async dismissGuidedTour() {
		return await driverHelper.clickIfPresent(
			this.driver,
			by.css( '.guided-tours__choice-button-row button:not(.is-primary)' ),
			1
		);
	}

	async _waitForPurchases() {
		return await driverHelper.waitTillNotPresent(
			this.driver,
			by.css( '.is-placeholder' ),
			this.explicitWaitMS * 3
		);
	}
}
