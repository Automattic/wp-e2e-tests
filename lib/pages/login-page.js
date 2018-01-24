import { By } from 'selenium-webdriver';
import { Key } from 'selenium-webdriver';
import config from 'config';

import BaseContainer from '../base-container.js';

import * as driverHelper from '../driver-helper.js';
import * as dataHelper from '../data-helper';
import * as slackNotifier from '../slack-notifier.js';

export default class LoginPage extends BaseContainer {
	constructor( driver, visit, overrideURL ) {
		let loginURL = LoginPage.getLoginURL();

		if ( typeof overrideURL === 'string' ) {
			loginURL = overrideURL;
		}

		super( driver, By.css( '#loginform, .wp-login__container' ), visit, loginURL );

		driverHelper.waitTillNotPresent( driver, By.css( 'input[disabled]#usernameOrEmail' ) );
	}

	login( username, password ) {
		const driver = this.driver;
		const userNameSelector = By.css( '#user_login, #usernameOrEmail' );
		const passwordSelector = By.css( '#user_pass, #password' );
		const submitSelector = By.css( '#wp-submit, button[type="submit"]' );
		const wpcomLoginSelector = By.css( '.wpcom-site' );

		driverHelper.setWhenSettable( driver, userNameSelector, username );

		return driverHelper.isElementPresent( driver, wpcomLoginSelector ).then( ( isWpcom ) => {
			if ( isWpcom ) {
				driver.findElement( userNameSelector ).sendKeys( Key.ENTER );
			}

			if ( password ) {
				driverHelper.setWhenSettable( driver, passwordSelector, password, { secureValue: true } );
				driverHelper.clickWhenClickable( driver, submitSelector );
			}
			return driverHelper.waitTillNotPresent( driver, userNameSelector );
		} );
	}

	requestMagicLink( emailAddress ) {
		driverHelper.clickWhenClickable( this.driver, By.css( 'a[data-e2e-link="magic-login-link"]' ) );
		driverHelper.setWhenSettable( this.driver, By.css( '.magic-login__email-fields input[name="usernameOrEmail"]' ), emailAddress );
		driverHelper.clickWhenClickable( this.driver, By.css( '.magic-login__form-action button.is-primary' ) );
		return driverHelper.waitTillPresentAndDisplayed( this.driver, By.css( '.magic-login__check-email-image' ) );
	}

	static getLoginURL() {
		const baseURL = config.get( 'calypsoBaseURL' );
		let loginURL = `${baseURL}/log-in`;

		// If Calypso is running locally in Docker, force login to actual WordPress.com first
		if ( config.has( 'calypsoDocker' ) && config.get( 'calypsoDocker' ) ) {
			loginURL = `https://wordpress.com/log-in?redirect_to=${baseURL}`;
		}

		// If we're using a live branch - we need to reload the root page with the branch name
		if ( dataHelper.isRunningOnLiveBranch() ) {
			loginURL = loginURL + '?branch=' + config.get( 'branchName' );
		}

		return loginURL;
	}
}
