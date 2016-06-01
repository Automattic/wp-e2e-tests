import { By } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper.js';

import BaseContainer from '../../base-container.js';

export default class ChooseAThemePage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.themes-list' ) );
	}
	selectFirstTheme() {
		return driverHelper.clickWhenClickable( this.driver, By.css( '.theme__active-focus' ), this.explicitWaitMS );
	}
}
