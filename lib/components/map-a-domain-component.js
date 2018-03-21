/** @format */

import { By } from 'selenium-webdriver';

import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper';

export default class MapADomainComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.transfer-domain-step' ) );
	}

	selectManuallyConnectExistingDomain() {
		const manuallyConnectSelector = By.css( '.card.transfer-domain-step__map-option a[href="#"]' );
		return driverHelper.clickWhenClickable(
			this.driver,
			manuallyConnectSelector
		);
	}
}
