import { By } from 'selenium-webdriver';

import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper';

export default class MapADomainComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.transfer-domain-step' ) );
	}

	selectManuallyConnectExistingDomain() {
		const manuallyConnectSelector = By.css( '#primary > main > span > div > div:nth-child(2) > div > div > p > a:nth-child(1)' );
		return driverHelper.clickWhenClickable( this.driver, manuallyConnectSelector, this.explicitWaitMS );
	}
}
