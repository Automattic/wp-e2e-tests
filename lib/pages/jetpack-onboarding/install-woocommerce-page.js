/** @format */

import { By } from 'selenium-webdriver';

import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';

export default class InstallWooCommercePage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.jetpack-onboarding' ) );
	}

	selectSellOnline() {
		return driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.steps__button-group a.button.is-primary' )
		);
	}

	selectNotRightNow() {
		return driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.steps__button-group a.button:not(.is-primary)' )
		);
	}
}
