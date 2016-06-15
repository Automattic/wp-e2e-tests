import { By } from 'selenium-webdriver';

import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

export default class ThemeDialogComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.themes-thanks-modal' ) );
	}
	goBackToThemes() {
		return driverHelper.clickWhenClickable( this.driver, By.css( '.dialog button' ) );
	}
}
