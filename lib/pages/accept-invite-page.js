/** @format */

import { By } from 'selenium-webdriver';

import BaseContainer from '../base-container.js';
import * as DriverHelper from '../driver-helper.js';

export default class AcceptInvitePage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.invite-accept' ) );
		driver.executeScript( 'localStorage.setItem( "debug", "calypso:invite-accept:*" )' );
	}

	getEmailPreFilled() {
		return this.driver.findElement( By.css( '#email' ) ).getAttribute( 'value' );
	}

	async enterUsernameAndPasswordAndSignUp( username, password ) {
		const userNameSelector = By.css( '#username' );
		const passwordSelector = By.css( '#password' );
		const submitSelector = By.css( '.signup-form__submit' );

		await DriverHelper.setWhenSettable( this.driver, userNameSelector, username );
		await DriverHelper.setWhenSettable( this.driver, passwordSelector, password, true );
		return await DriverHelper.clickWhenClickable( this.driver, submitSelector );
	}

	getHeaderInviteText() {
		return this.driver.findElement( By.css( '.invite-header__invited-you-text' ) ).getText();
	}

	async waitUntilNotVisible() {
		const driver = this.driver;
		const explicitWaitMS = this.explicitWaitMS;
		const userNameSelector = By.css( '#username' );

		return await driver.wait(
			function() {
				return DriverHelper.isElementPresent( driver, userNameSelector ).then( function( present ) {
					return ! present;
				} );
			},
			explicitWaitMS,
			'The accept invite signup form is still displayed after submitting the form'
		);
	}
}
