/** @format */
import { By, until } from 'selenium-webdriver';
import BaseContainer from '../base-container';

import * as driverHelper from '../driver-helper';

const TEMPLATE_URL = 'http://jurassic.ninja/create';
const PASSWORD_ELEMENT = By.css( '#jurassic_password' );
const URL_ELEMENT = By.css( '#jurassic_url' );
const CONTINUE_LINK = By.linkText( 'The new WP is ready to go, visit it!' );

export default class WporgCreatorPage extends BaseContainer {
	constructor( driver ) {
		super( driver, CONTINUE_LINK, /* visit url */ true, TEMPLATE_URL );
		driverHelper.clickWhenClickable( driver, CONTINUE_LINK );
	}

	getPassword() {
		this.driver.wait( until.elementLocated( PASSWORD_ELEMENT ) );
		return this.driver.findElement( PASSWORD_ELEMENT ).getText();
	}

	getUrl() {
		this.driver.wait( until.elementLocated( URL_ELEMENT ) );
		return this.driver.findElement( URL_ELEMENT ).getText();
	}

	waitForWpadmin() {
		return driverHelper.waitTillPresentAndDisplayed( this.driver, PASSWORD_ELEMENT );
	}
}
