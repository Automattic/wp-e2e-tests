import { By } from 'selenium-webdriver';
import config from 'config';
import slack from 'slack-notify';

import BaseContainer from '../base-container.js';

import * as driverHelper from '../driver-helper.js';

export default class LoginPage extends BaseContainer {
	constructor( driver, visit ) {
		const authURL = config.get( 'authURL' );
		super( driver, By.css( '#loginform' ), visit, authURL );
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
			return driver.wait( function() {
				return driver.isElementPresent( userNameSelector ).then( function( present ) {
					return !present;
				} );
			}, explicitWaitMS ).then( () => {}, ( error ) => {
				const message = `Found issue on login page: '${error}' - Trying to log in again now.`;
				console.log( message );
				if ( config.has( 'slackHook' ) ) {
					let slackClient = slack( config.get( 'slackHook' ) );
					slackClient.send( {
						icon_emoji: ':a8c:',
						text: message,
						username: 'WebDriverJS'
					} );
				}
				driverHelper.setWhenSettable( driver, userNameSelector, username );
				driverHelper.setWhenSettable( driver, passwordSelector, password, { secureValue: true } );
				driverHelper.clickWhenClickable( driver, submitSelector );
				return driver.wait( function() {
					return driver.isElementPresent( userNameSelector ).then( function( present ) {
						return !present;
					} );
				}, explicitWaitMS, 'The login page is still showing after trying to log in for a second time' );
			} );
		} );
	}
}
