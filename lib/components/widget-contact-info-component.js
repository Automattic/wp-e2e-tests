import { By } from 'selenium-webdriver';

import BaseContainer from '../base-container.js';

export default class WidgetContactInfoComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.widget_contact_info' ) );
	}

	getName() {
		return this.driver.findElement( By.css('.widget_contact_info h2.widget-title') ).getText();
	}

	getAddress() {
		return this.driver.findElement( By.css('.widget_contact_info div.confit-address a') ).getText();
	}
}
