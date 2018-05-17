/** @format */

import { By, until } from 'selenium-webdriver';
import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

export default class ThemeDetailPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.theme__sheet.main' ) );
	}

	async openLiveDemo() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'a.theme__sheet-preview-link' )
		);
	}

	activateTheme() {
		return driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.theme__sheet-action-bar button.theme__sheet-primary-button' )
		);
	}

	async goBackToAllThemes() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'a.button.header-cake__back' )
		);
	}

	async pickThisDesign() {
		const selector = By.css( '.theme__sheet-primary-button' );
		return await driverHelper.clickWhenClickable( this.driver, selector, this.explicitWaitMS );
	}

	getThemePrice() {
		const selector = By.css( '.theme__sheet-action-bar-cost' );

		this.driver.wait(
			until.elementLocated( selector ),
			this.explicitWaitMS,
			'Could not locate the theme price element'
		);
		return this.driver.findElement( selector ).getText();
	}
}
