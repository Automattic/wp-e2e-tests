/** @format */

import webdriver from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper.js';

const by = webdriver.By;

export default class JetpackPlansSalesPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.className( 'cta-install' ) );
	}

	async clickPurchaseButton() {
		const selector = by.css( '.cta-install a' );
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}
}
