/** @format */

import { By } from 'selenium-webdriver';
import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

export default class GSuiteUpsellPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.google-apps-dialog__checkout-button' ) );
	}

	declineEmail() {
		return driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.google-apps-dialog__checkout-button' )
		);
	}
}
