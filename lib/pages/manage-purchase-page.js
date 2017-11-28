import webdriver from 'selenium-webdriver';

import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

const by = webdriver.By;

export default class ManagePurchasePage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.manage-purchase.main' ) );
		driverHelper.waitTillNotPresent( this.driver, by.css( '.is-placeholder' ) );
		this.removeButtonConfirmSelector = by.css( 'button[data-e2e-button="remove"]' );
	}

	domainDisplayed() {
		return this.driver.findElement( by.css( '.manage-purchase__title' ) ).getText();
	}

	chooseCancelAndRefund() {
		return driverHelper.clickWhenClickable( this.driver, by.css( '.manage-purchase a[href$="cancel"]' ) );
	}

	chooseRemovePurchase() {
		return driverHelper.clickWhenClickable( this.driver, by.css( '.remove-purchase__card' ) );
	}

	removeNow() {
		return driverHelper.clickWhenClickable( this.driver, this.removeButtonConfirmSelector );
	}

	waitTillRemoveNoLongerShown() {
		return driverHelper.waitTillNotPresent( this.driver, this.removeButtonConfirmSelector );
	}
}
