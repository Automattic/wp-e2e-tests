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

	enterUsernameAndPasswordAndSignUp( username, password ) {
		const userNameSelector = By.css( '#username' );
		const passwordSelector = By.css( '#password' );
		const submitSelector = By.css( '.signup-form__submit' );

		DriverHelper.setWhenSettable( this.driver, userNameSelector, username );
		DriverHelper.setWhenSettable( this.driver, passwordSelector, password, true );
		return DriverHelper.clickWhenClickable( this.driver, submitSelector );
	}

	getHeaderInviteText() {
		return this.driver.findElement( By.css( '.invite-header__invited-you-text' ) ).getText();
	}

	waitUntilNotVisible() {
		const driver = this.driver;
		const explicitWaitMS = this.explicitWaitMS;
		const userNameSelector = By.css( '#username' );

		return driver.wait( function() {
			return DriverHelper.isElementPresent( driver, userNameSelector ).then( function( present ) {
				return !present;
			} );
		}, explicitWaitMS, 'The accept invite signup form is still displayed after submitting the form' );
	}
}
