/** @format */

import webdriver from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper';
import BaseContainer from '../../base-container.js';

const by = webdriver.By;

export default class StoreSettingsPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.woocommerce .settingsPayments' ) );
	}

	selectPaymentsTab() {
		driverHelper.ensureMobileMenuOpen( this.driver );
		return driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.woocommerce .section-nav__panel a[href*=payments]' )
		);
	}

	paymentsSettingsDisplayed() {
		return driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			by.css( '.woocommerce .settingsPayments' )
		);
	}

	selectShippingTab() {
		driverHelper.ensureMobileMenuOpen( this.driver );
		return driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.woocommerce .section-nav__panel a[href*=shipping]' )
		);
	}

	shippingSettingsDisplayed() {
		return driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			by.css( '.woocommerce .shipping' )
		);
	}

	selectTaxesTab() {
		driverHelper.ensureMobileMenuOpen( this.driver );
		return driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.woocommerce .section-nav__panel a[href*=taxes]' )
		);
	}

	taxesSettingsDisplayed() {
		return driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			by.css( '.woocommerce .settings-taxes' )
		);
	}
}
