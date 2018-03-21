/** @format */

import webdriver from 'selenium-webdriver';
import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

const by = webdriver.By;

export default class JetpackPlansSalesPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.className( 'cta-install' ) );
	}

	clickPurchaseButton() {
		const selector = by.css( '.cta-install a' );
		return driverHelper.clickWhenClickable( this.driver, selector );
	}
}
