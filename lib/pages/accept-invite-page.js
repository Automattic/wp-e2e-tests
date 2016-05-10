import { By } from 'selenium-webdriver';
import config from 'config';

import BaseContainer from '../base-container.js';

import * as DriverHelper from '../driver-helper.js';
import * as MediaHelper from '../media-helper.js';

export default class AcceptInvitePage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.invite-accept' ) );
		driver.executeScript( `localStorage.setItem( 'debug', 'calypso:invite-accept:*' )` );
	}

	getEmailPreFilled() {
		return this.driver.findElement( By.css( '#email' ) ).getAttribute( 'value' );
	}

	enterUsernameAndPasswordAndSignUp( username, password ) {
		const driver = this.driver;
		const userNameSelector = By.css( '#username' );
		const passwordSelector = By.css( '#password' );
		const submitSelector = By.css( '.signup-form__submit' );
		const longExplicitWaitMS = this.explicitWaitMS * 2;

		DriverHelper.setWhenSettable( this.driver, userNameSelector, username );
		DriverHelper.setWhenSettable( this.driver, passwordSelector, password, true );
		DriverHelper.clickWhenClickable( this.driver, submitSelector );
		if ( config.get( 'saveAllScreenshots' ) === true ) {
			driver.takeScreenshot().then( ( data ) => {
				MediaHelper.writeScreenshot( data, 'acceptInviteSignupScreen' );
			} );
		}
		return driver.wait( function() {
			return driver.isElementPresent( userNameSelector ).then( function( present ) {
				return !present;
			} );
		}, longExplicitWaitMS, 'The accept invite signup form is still displayed after submitting the form' );
	}

	getHeaderInviteText() {
		return this.driver.findElement( By.css( '.invite-header__invited-you-text' ) ).getText();
	}
}
