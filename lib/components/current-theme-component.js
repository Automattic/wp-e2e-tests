import { By } from 'selenium-webdriver';

import BaseContainer from '../base-container.js';

export default class CurrentThemeComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.current-theme' ) );
	}

	getThemeName() {
		return this.driver.findElement( By.css( '.current-theme__name' ) ).getText();
	}
}
