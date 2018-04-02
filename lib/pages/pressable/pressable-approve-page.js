/** @format */

import { By } from 'selenium-webdriver';
import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';

export default class PressableApprovePage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( 'form#authorize img[alt="MyPressable"]' ) );
	}

	deny() {
		const denyButtonSelector = By.css( '#deny' );
		return driverHelper.clickWhenClickable( this.driver, denyButtonSelector );
	}

	approve() {
		const approveButtonSelector = By.css( '#approve' );
		return driverHelper.clickWhenClickable( this.driver, approveButtonSelector );
	}
}
