/** @format */

import { By } from 'selenium-webdriver';

import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class WooWizardShippingPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( 'div.wc-setup-content ul.shipping' ) );
	}

	async selectContinue() {
		const continueButtonSelector = By.css( 'button.button-next' );
		return await driverHelper.clickWhenClickable( this.driver, continueButtonSelector );
	}
}
