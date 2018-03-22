/** @format */

import { By } from 'selenium-webdriver';

import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

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

		driverHelper.setWhenSettable( this.driver, userNameSelector, username );
		driverHelper.setWhenSettable( this.driver, passwordSelector, password, true );
		return driverHelper.clickWhenClickable( this.driver, submitSelector );
	}

	getHeaderInviteText() {
		return this.driver.findElement( By.css( '.invite-header__invited-you-text' ) ).getText();
	}

	waitUntilNotVisible() {
		const userNameSelector = By.css( '#username' );

		return driverHelper.waitTillNotPresent( this.driver, userNameSelector );
	}
}
