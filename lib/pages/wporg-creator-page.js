/** @format */
import { By as by, until } from 'selenium-webdriver';
import BaseContainer from '../base-container';

import * as driverHelper from '../driver-helper';

const TEMPLATE_URL = 'http://poopy.life/create?src=weary-duck&key=pVP6jBZR1C6wALZh';
const PASSWORD_ELEMENT = by.css( '#tdr_password' );

export default class WporgCreatorPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.continue-to-install' ), /* visit url */ true, TEMPLATE_URL );
		driverHelper.clickWhenClickable( driver, by.css( '.continue-to-install' ) );
	}

	getPassword() {
		this.driver.wait(
			until.elementLocated( PASSWORD_ELEMENT ),
			3000,
			'Could not locate password element'
		);
		return this.driver.findElement( PASSWORD_ELEMENT ).getText();
	}

	waitForWpadmin() {
		return driverHelper.waitTillPresentAndDisplayed( this.driver, PASSWORD_ELEMENT );
	}
}
