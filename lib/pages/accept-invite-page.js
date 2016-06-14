import { By } from 'selenium-webdriver';
import slack from 'slack-notify';
import config from 'config';

import LoginPage from './login-page';
import BaseContainer from '../base-container.js';
import * as DriverHelper from '../driver-helper.js';

export default class AcceptInvitePage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.invite-accept' ) );
		driver.executeScript( `localStorage.setItem( 'debug', 'calypso:invite-accept:*' )` );
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
		const longExplicitWaitMS = this.explicitWaitMS * 2;
		const userNameSelector = By.css( '#username' );

		return driver.wait( function() {
			return driver.isElementPresent( userNameSelector ).then( function( present ) {
				return !present;
			} );
		}, longExplicitWaitMS, 'The accept invite signup form is still displayed after submitting the form' );
	}

	ensureWeAreLoggedIn( username, password ) {
		const driver = this.driver;

		return driver.isElementPresent( By.css( '#user_login' ) ).then( ( present ) => {
			if ( present ) {
				const message = `Found issue after accepting the invite where we are now logged out - Re-logging on now`;
				console.log( message );
				if ( config.has( 'slackHook' ) ) {
					let slackClient = slack( config.get( 'slackHook' ) );
					slackClient.send( {
						icon_emoji: ':a8c:',
						text: message,
						username: 'WebDriverJS'
					} );
				}
				this.loginPage = new LoginPage( driver, false );
				return this.LoginPage.login( username, password );
			}
			return true;
		} )
	}
}
