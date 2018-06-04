/** @format */

import { By } from 'selenium-webdriver';
import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

export default class MagicLoginPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.magic-login__handle-link' ) );
	}

	async finishLogin() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.magic-login__handle-link button.is-primary' )
		);
	}
}
