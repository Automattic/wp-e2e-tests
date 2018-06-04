/** @format */

import { By, until } from 'selenium-webdriver';

import BaseContainer from '../../base-container.js';
import * as driverHelper from '../../driver-helper.js';

export default class CreateYourAccountPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.signup-form' ) );
	}

	async enterAccountDetailsAndSubmit( email, username, password ) {
		await driverHelper.setWhenSettable( this.driver, By.css( '#email' ), email );
		await driverHelper.setWhenSettable( this.driver, By.css( '#username' ), username );
		await driverHelper.setWhenSettable( this.driver, By.css( '#password' ), password, {
			secureValue: true,
		} );

		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'button.signup-form__submit' )
		);
	}

	waitForValidationErrors() {
		const errorSelector = By.css( 'div.is-error' );
		this.waitForPage();
		this.driver.wait(
			until.elementLocated( errorSelector ),
			this.explicitWaitMS,
			'Could not locate validation errors'
		);
		const errorElement = this.driver.findElement( errorSelector );
		return this.driver.wait(
			until.elementIsVisible( errorElement ),
			this.explicitWaitMS,
			'Could not see validation errors displayed'
		);
	}

	clickLoginLink() {
		const selector = By.css( 'a.logged-out-form__link-item[href*="log-in"]' );
		return driverHelper.clickWhenClickable( this.driver, selector, this.explicitWaitMS );
	}
}
