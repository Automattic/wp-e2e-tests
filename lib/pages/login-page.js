import { By } from 'selenium-webdriver';
import config from 'config';

import BaseContainer from '../base-container.js';

import * as driverHelper from '../driver-helper.js';
import * as mediaHelper from '../media-helper.js';

export default class LoginPage extends BaseContainer {
	constructor( driver, visit ) {
		const authURL = config.get( 'authURL' );
		const baseURL = config.get( 'calypsoBaseURL' );
		const loginURL = `${authURL}?redirect_to=${baseURL}`;

		super( driver, By.css( '#loginform' ), visit, loginURL );
	}

	login( username, password ) {
		const driver = this.driver;
		const userNameSelector = By.id( 'user_login' );
		const passwordSelector = By.id( 'user_pass' );
		const submitSelector = By.id( 'wp-submit' );
		const explicitWaitMS = this.explicitWaitMS;

		// Wait for the username field to have focus to avoid login failures
		// -- the wp_attempt_focus() function is on a 200ms timeout, so let's wait 500ms
		return driver.sleep( 500 ).then( function() {
			driverHelper.setWhenSettable( driver, userNameSelector, username );
			driverHelper.setWhenSettable( driver, passwordSelector, password, { secureValue: true } );
			driverHelper.clickWhenClickable( driver, submitSelector );
			if ( config.get( 'saveAllScreenshots' ) === true ) {
				driver.takeScreenshot().then( ( data ) => {
					mediaHelper.writeScreenshot( data, 'loginScreen' );
				} );
			}
			return driver.wait( function() {
				return driver.isElementPresent( userNameSelector ).then( function( present ) {
					return !present;
				} );
			}, explicitWaitMS, 'The login form is still displayed after submitting the logon form' );
		} );
	}
}
