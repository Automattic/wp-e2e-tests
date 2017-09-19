import { By } from 'selenium-webdriver';
import config from 'config';

import BaseContainer from '../base-container.js';

import * as driverHelper from '../driver-helper.js';

export default class LoginPage extends BaseContainer {
	constructor( driver, visit, overrideURL ) {
		const baseURL = config.get( 'calypsoBaseURL' );
		let loginURL = `${baseURL}/log-in`;

		if ( typeof overrideURL === 'string' ) {
			loginURL = overrideURL;
		}

		if ( config.has( 'liveBranch' ) && config.get( 'liveBranch' ) ) {
			loginURL = loginURL + '?branch=' + config.get( 'branchName' );
		}

		super( driver, By.css( '#loginform, .wp-login__container' ), visit, loginURL );
	}

	login( username, password ) {
		const driver = this.driver;
		const userNameSelector = By.css( '#user_login, #usernameOrEmail' );
		const passwordSelector = By.css( '#user_pass, #password' );
		const submitSelector = By.css( '#wp-submit, button[type="submit"]' );

		// Wait for the username field to have focus to avoid login failures
		// -- the wp_attempt_focus() function is on a 200ms timeout, so let's wait 500ms
		return driver.sleep( 500 ).then( function() {
			driverHelper.setWhenSettable( driver, userNameSelector, username );
			driverHelper.setWhenSettable( driver, passwordSelector, password, { secureValue: true } );
			driverHelper.waitTillPresentAndDisplayed( driver, submitSelector );
			return driver.findElement( submitSelector ).click();
		} );
	}
}
