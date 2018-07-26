/** @format */

import { By } from 'selenium-webdriver';

import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper';

export default class TransferDomainPrecheckPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.transfer-domain-step__precheck' ) );
	}

	async enterAuthCode( code ) {
		return await driverHelper.setWhenSettable(
			this.driver,
			By.css( '.transfer-domain-step__auth-code-input' ),
			code
		);
	}

	async clickCheckAuthCode() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.transfer-domain-step__section-action button' )
		);
	}

	async authCodeErrorDisplayed() {
		return await driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			By.css( '.form-input-validation.is-error[role=alert]' )
		);
	}
}
