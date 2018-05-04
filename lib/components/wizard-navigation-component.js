/** @format */

import { By } from 'selenium-webdriver';

import BaseContainer from '../base-container.js';

import * as driverHelper from '../driver-helper.js';

export default class WizardNavigationComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.wizard__navigation-links' ) );
		driver.sleep( 1000 );
	}

	goBack() {
		return driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'a.wizard__navigation-link .gridicons-arrow-left' )
		);
	}

	skipStep() {
		return driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'a.wizard__navigation-link .gridicons-arrow-right' )
		);
	}
}
