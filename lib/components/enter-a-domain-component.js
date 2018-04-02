/** @format */

import { By } from 'selenium-webdriver';

import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper';

export default class EnterADomainComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.map-domain-step__add-domain' ) );
	}

	enterADomain( blogName ) {
		const entryInputSelector = By.className( 'map-domain-step__external-domain' );
		driverHelper.setWhenSettable( this.driver, entryInputSelector, blogName );
	}

	clickonAddButtonToAddDomainToTheCart() {
		const addDomainSelector = By.css( '.map-domain-step__go.button.is-primary' );
		return driverHelper.clickWhenClickable( this.driver, addDomainSelector );
	}
}
