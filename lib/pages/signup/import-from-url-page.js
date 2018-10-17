/** @format */

import { By } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper.js';

import AsyncBaseContainer from '../../async-base-container';

export default class ImportFromURLPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.import-url' ) );
	}

	async submitForm() {
		const buttonSelector = By.css( '.import-url__submit-button' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, buttonSelector );
		await driverHelper.scrollIntoView( this.driver, buttonSelector );
		return await driverHelper.clickWhenClickable( this.driver, buttonSelector );
	}

	async enterURL( url ) {
		await driverHelper.setWhenSettable( this.driver, By.css( '#url-input' ), url );
	}
}
