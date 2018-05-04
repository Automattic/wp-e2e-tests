/** @format */

import { By } from 'selenium-webdriver';

import BaseContainer from '../../base-container.js';

import * as driverHelper from '../../driver-helper';

export default class WizardJetpackPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( 'div.wc-setup-content form.activate-jetpack' ) );
	}

	selectContinueWithJetpack() {
		driverHelper.clickWhenClickable( this.driver, By.css( 'button.button-primary' ) );
		return driverHelper.waitTillNotPresent( this.driver, By.css( 'div.blockUI' ) );
	}
}
