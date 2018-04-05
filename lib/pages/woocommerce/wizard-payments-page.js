import { By } from 'selenium-webdriver';

import BaseContainer from '../../base-container.js';

import * as driverHelper from '../../driver-helper';

export default class WizardPaymentsPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( 'div.wc-setup-content form.wc-wizard-payment-gateway-form' ) );
	}

	selectContinue() {
		return driverHelper.clickWhenClickable( this.driver, By.css( 'button.button-next' ) );
	}

}
