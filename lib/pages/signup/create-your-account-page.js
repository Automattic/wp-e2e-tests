import { By, until } from 'selenium-webdriver';

import BaseContainer from '../../base-container.js';
import * as driverHelper from '../../driver-helper.js';
import * as SlackNotifier from '../../slack-notifier';

export default class CreateYourAccountPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.signup-form' ) );
		driver.getCurrentUrl().then( ( u ) => {
			SlackNotifier.warn( 'URL on create account page to re visit: ' + u );
			driver.get( u );
			driver.sleep( 20000 ).then( () => {
				console.log( 'sleeping' );
			} );
		} );
		this.waitForPage();
	}

	enterAccountDetailsAndSubmit( email, username, password ) {
		driverHelper.setWhenSettable( this.driver, By.css( '#email' ), email );
		driverHelper.setWhenSettable( this.driver, By.css( '#username' ), username );
		driverHelper.setWhenSettable( this.driver, By.css( '#password' ), password, { secureValue: true } );

		return driverHelper.clickWhenClickable( this.driver, By.css( 'button.signup-form__submit' ) );
	}

	waitForValidationErrors() {
		const errorSelector = By.css( 'div.is-error' );
		this.waitForPage();
		this.driver.wait( until.elementLocated( errorSelector ), this.explicitWaitMS, 'Could not locate validation errors' );
		const errorElement = this.driver.findElement( errorSelector );
		return this.driver.wait( until.elementIsVisible( errorElement ), this.explicitWaitMS, 'Could not see validation errors displayed' );
	}
}
