import { By, until } from 'selenium-webdriver';
import webdriver from 'selenium-webdriver';
import BaseContainer from '../base-container.js';

import * as DriverHelper from '../driver-helper.js';

export default class InvitePeoplePage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( 'select#role' ) );
	}

	inviteNewUser( email, role, message = '' ) {
		if ( role === 'viewer' ) {
			role = 'follower'; //the select input option uses follower for viewer
		}
		DriverHelper.setWhenSettable( this.driver, By.css( 'input.token-field__input' ), email );
		DriverHelper.clickWhenClickable( this.driver, By.css( 'select#role' ) );
		DriverHelper.clickWhenClickable( this.driver, By.css( `select#role option[value=${role}]` ) );
		DriverHelper.setWhenSettable( this.driver, By.css( '#message' ), message );
		return DriverHelper.clickWhenClickable( this.driver, By.css( 'button.button.is-primary' ) );
	}

	inviteSent() {
		this.driver.wait( until.elementLocated( By.css( '.notice__text' ) ), this.explicitWaitMS, 'The notice was not displayed' );
		return this.driver.isElementPresent( By.css( '.notice__text' ) );
	}
}
