import { By } from 'selenium-webdriver';

import BaseContainer from '../base-container.js';

import * as driverHelper from '../driver-helper.js';

export default class DomainsPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.domain-management-list__items' ) );
	}

	numberOfDomainsDisplayed() {
		return this.driver.findElements( By.css( '.domain-management-list-item' ) ).then( function( elements ) {
			return elements;
		} );
	}

	clickAddDomain() {
		return driverHelper.clickWhenClickable( this.driver, By.css('.domain-management-list__add-a-domain') );
	}
}
