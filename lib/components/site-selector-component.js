/** @format */

import { By } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper.js';

import BaseContainer from '../base-container.js';

class SiteSelectorComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.site-selector-modal' ) );
		this.firstSiteSelector = By.css( 'div.site-selector-modal div.site-selector__sites a' );
	}

	back() {
		return driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.dialog button' ),
			this.explicitWaitMS
		);
	}

	async ok() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.dialog .button.is-primary' ),
			this.explicitWaitMS
		);
	}

	async selectFirstSite() {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.sites-dropdown' ),
			this.explicitWaitMS
		);

		const element = await this.driver.findElement( this.firstSiteSelector );
		this.selectedSiteDomain = await element.findElement( By.css( '.site__domain' ) ).getText();
		await element.click();
	}
}

export default SiteSelectorComponent;
