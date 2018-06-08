/** @format */

import { By } from 'selenium-webdriver';

import AsyncBaseContainer from '../async-base-container';

import * as driverHelper from '../driver-helper.js';

export default class SignupStepComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.signup__step' ) );
	}

	async waitForSignupStepLoad() {
		const selector = By.css( '.signup__step-enter' );
		return await driverHelper.waitTillNotPresent( this.driver, selector );
	}
}
