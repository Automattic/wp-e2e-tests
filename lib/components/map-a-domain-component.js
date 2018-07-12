/** @format */

import { By } from 'selenium-webdriver';

import * as driverHelper from '../driver-helper';
import AsyncBaseContainer from '../async-base-container';

export default class MapADomainComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.use-your-domain-step' ) );
	}

	async selectManuallyConnectExistingDomain() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.use-your-domain-step__option-button' ),
			this.explicitWaitMS
		);
	}
}
