import { By } from 'selenium-webdriver';
import config from 'config';

import BaseContainer from '../base-container.js';

import * as driverHelper from '../driver-helper.js';
import * as slackNotifier from '../slack-notifier.js';

export default class LoginPage extends BaseContainer {
	constructor( driver, visit, queryString ) {
		const authURL = config.get( 'authURL' );
		const baseURL = config.get( 'calypsoBaseURL' );
		const loginURL = `${authURL}?redirect_to=${baseURL}${ queryString || '' }`;

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
			driverHelper.waitTillPresentAndDisplayed( driver, submitSelector );
			driver.findElement( submitSelector ).click();
			driver.wait( function() {
				return driverHelper.isElementPresent( driver, userNameSelector ).then( function( present ) {
					return !present;
				} );
			}, explicitWaitMS ).then( () => {}, ( error ) => {
				const message = `Found issue on login page: '${error}' - Trying to log in again now.`;
				slackNotifier.warn( message );
				driverHelper.setWhenSettable( driver, userNameSelector, username );
				driverHelper.setWhenSettable( driver, passwordSelector, password, { secureValue: true } );
				driverHelper.clickWhenClickable( driver, submitSelector );
				return driver.wait( function() {
					return driverHelper.isElementPresent( driver, userNameSelector ).then( function( present ) {
						return !present;
					} );
				}, explicitWaitMS, 'The login page is still showing after trying to log in for a second time' );
			} );

			// If we're using a live branch - we need to reload the root page with the branch name
			if ( config.has( 'liveBranch' ) && config.get( 'liveBranch' ) === 'true' ) {
				const url = config.get( 'calypsoBaseURL' ) + '?branch=' + config.get( 'branchName' );
				return driver.get( url );
			}
		} );
	}
}
