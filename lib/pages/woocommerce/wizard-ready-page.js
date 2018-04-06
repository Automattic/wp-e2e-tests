import { By } from 'selenium-webdriver';

import BaseContainer from '../../base-container.js';

import * as driverHelper from '../../driver-helper';

export default class WizardReadyPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( 'div.wc-setup-content ul.wc-wizard-next-steps' ) );
	}

	selectContinue() {
		return driverHelper.clickWhenClickable( this.driver, By.css( 'button.button-next' ) );
	}

}
