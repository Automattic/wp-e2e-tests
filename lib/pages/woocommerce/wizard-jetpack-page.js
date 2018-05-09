/** @format */

import { By } from 'selenium-webdriver';

import BaseContainer from '../../base-container.js';

import * as driverHelper from '../../driver-helper';

export default class WizardJetpackPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( 'div.wc-setup-content form.activate-jetpack' ) );
	}

	selectContinueWithJetpack() {
		const buttonSelector = By.css( 'button.button-primary' );
		driverHelper.clickWhenClickable( this.driver, buttonSelector );
		return driverHelper.waitTillNotPresent( this.driver, buttonSelector, this.explicitWaitMS * 2 );
	}
}
