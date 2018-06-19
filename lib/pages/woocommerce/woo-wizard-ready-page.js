/** @format */

import { By } from 'selenium-webdriver';

import BaseContainer from '../../base-container.js';

import * as driverHelper from '../../driver-helper';

export default class WooWizardReadyPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( 'div.wc-setup-content ul.wc-wizard-next-steps' ) );
	}

	async selectContinue() {
		return await driverHelper.clickWhenClickable( this.driver, By.css( 'button.button-next' ) );
	}
}
