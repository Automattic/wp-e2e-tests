/** @format */

import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper.js';
import * as driverManager from '../driver-manager';

export default class ThemeDetailPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.theme__sheet.main' ) );
	}

	async openLiveDemo() {
		const demoSelector = driverManager.currentScreenSize() === 'mobile' ? 'a.theme__sheet-preview-link' : 'li.is-theme-preview a';
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( demoSelector )
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
}
