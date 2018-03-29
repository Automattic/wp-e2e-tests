/** @format */

import { By } from 'selenium-webdriver';
import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';

export default class WPAdminNewUserPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( 'h1#add-new-user' ) );
	}

	addUser( username, email = username ) {
		const usernameInputSelector = By.css( '#user_login' );
		const emailInputSelector = By.css( '#email' );
		const passwordButtonSelector = By.css( '.wp-generate-pw' );
		const passwordInputSelector = By.css( '#pass1-text' );
		const buttonSelector = By.css( '#createusersub' );
		const successNoticeSelector = By.css( '#message.updated a[href*="user-edit"]' );

		return driverHelper
			.setWhenSettable( this.driver, usernameInputSelector, username )
			.then( () => driverHelper.setWhenSettable( this.driver, emailInputSelector, email ) )
			.then( () => driverHelper.clickWhenClickable( this.driver, passwordButtonSelector ) )
			.then( () => driverHelper.setWhenSettable( this.driver, passwordInputSelector, email ) )
			.then( () => driverHelper.clickWhenClickable( this.driver, buttonSelector ) )
			.then( () => driverHelper.waitTillPresentAndDisplayed( this.driver, successNoticeSelector ) );
	}
}
