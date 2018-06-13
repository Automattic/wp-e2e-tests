/** @format */

import { By } from 'selenium-webdriver';

import AsyncBaseContainer from '../async-base-container.js';

export default class WidgetContactInfoComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.widget_contact_info' ) );
	}

	getName() {
		return this.driver.findElement( By.css( '.widget_contact_info h2.widget-title' ) ).getText();
	}

	getAddress() {
		return this.driver
			.findElement( By.css( '.widget_contact_info div.confit-address a' ) )
			.getText();
	}
}
