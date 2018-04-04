/** @format */

import { By, until } from 'selenium-webdriver';

import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

export default class ThemeDialogComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.themes__thanks-modal' ) );
		this.driver.wait(
			until.elementLocated( By.css( '.themes__thanks-modal h1' ) ),
			this.explicitWaitMS * 2,
			'The message for activating a theme on the "thank you" dialog is not showing after waiting for it to show'
		);
	}

	goToThemeDetail() {
		return driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.dialog button[data-e2e-button="learn"]' )
		);
	}

	customizeSite() {
		return driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.dialog button[data-e2e-button="customizeSite"]' )
		);
	}
}
