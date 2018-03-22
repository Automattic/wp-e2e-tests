/** @format */

import { By } from 'selenium-webdriver';

import BaseContainer from '../base-container.js';

import * as driverHelper from '../driver-helper.js';

export default class DomainDetailsPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( 'main.domain-management-edit' ) );
	}

	viewPaymentSettings() {
		return driverHelper.clickWhenClickable( this.driver, By.css( 'a.subscription-settings' ) );
	}
}
