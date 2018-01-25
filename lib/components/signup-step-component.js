import { By } from 'selenium-webdriver';

import BaseContainer from '../base-container.js';

import * as driverHelper from '../driver-helper.js';

export default class SignupStepComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.signup__step' ) );
	}

	waitForSignupStepLoad() {
		const selector = By.css( '.signup__step-enter' );
		return driverHelper.waitTillNotPresent( this.driver, selector );
	}
}
