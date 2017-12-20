import { By } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper.js';
import * as driverManager from '../../driver-manager.js';

import BaseContainer from '../../base-container.js';

export default class AboutPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.about__wrapper' ) );
	}

	submitForm() {
		return driverHelper.clickWhenClickable( this.driver, By.css( '.about__submit-wrapper button.is-primary' ), this.explicitWaitMS );
	}
}
