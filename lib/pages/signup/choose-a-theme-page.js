import { By } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper.js';

import BaseContainer from '../../base-container.js';

export default class ChooseAThemePage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.themes-list' ) );
	}
	selectFirstTheme() {
		const driver = this.driver;
		const explicitWaitMS = this.explicitWaitMS;
		const mainSelector = By.css( '.theme__active-focus' );
		const designTypesSelector = By.css( '.design-type__list' );
		const designTypeChoiceSelector = By.css( 'a.design-type__choice__link' );
		const dssThemeSelector = By.css( '.dss-theme-thumbnail__theme' );
		driver.isElementPresent( designTypesSelector ).then( ( designTypePresent ) => {
			if ( designTypePresent === true ) {
				driverHelper.clickWhenClickable( driver, designTypeChoiceSelector, explicitWaitMS );
			}
		} );
		if ( this.dssEnabled === true ) {
			return driverHelper.clickWhenClickable( driver, dssThemeSelector, explicitWaitMS );
		}
		return driverHelper.clickWhenClickable( driver, mainSelector, explicitWaitMS );
	}
}
