/** @format */

import { By } from 'selenium-webdriver';

import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';

export default class ActivateStatsPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.jetpack-onboarding' ) );
	}

	selectActivateStats() {
		// Button is not ready right away causing not expected redirects for some tests
		this.driver.sleep( 1000 );
		return driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'a.card[data-e2e-type="activate-stats"] button' )
		);
	}

	selectContinue() {
		const continueSelector = By.css( 'a.card[data-e2e-type="continue"] button' );
		return driverHelper
			.waitTillPresentAndDisplayed( this.driver, continueSelector )
			.then( () => driverHelper.clickWhenClickable( this.driver, continueSelector ) );
	}
}
