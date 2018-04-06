/** @format */

import { By } from 'selenium-webdriver';
import { Key } from 'selenium-webdriver';
import config from 'config';

import BaseContainer from '../base-container.js';

import * as driverHelper from '../driver-helper.js';
import * as dataHelper from '../data-helper';
require( 'babel-polyfill' );

export default class LoginPage extends BaseContainer {
	constructor( driver, visit, overrideURL ) {
		let loginURL = LoginPage.getLoginURL();

		if ( typeof overrideURL === 'string' ) {
			loginURL = overrideURL;
		}

		super( driver, By.css( '#loginform, .wp-login__container' ), visit, loginURL );

		driverHelper.waitTillNotPresent( driver, By.css( 'input[disabled]#usernameOrEmail' ) );
	}

	async login( username, password ) {
		const driver = this.driver;
		const userNameSelector = By.css( '#user_login, #usernameOrEmail' );
		const passwordSelector = By.css( '#user_pass, #password' );
		const submitSelector = By.css( '#wp-submit, button[type="submit"]' );
		const wpcomLoginSelector = By.css( '.wpcom-site' );
		await driverHelper.setWhenSettable( driver, userNameSelector, username );

		return await driverHelper
			.isElementPresent( driver, wpcomLoginSelector )
			.then( async isWpcom => {
				if ( isWpcom ) {
					await driver.findElement( userNameSelector ).sendKeys( Key.ENTER );
				}

				if ( password ) {
					await driverHelper.setWhenSettable( driver, passwordSelector, password, {
						secureValue: true,
					} );
					await driverHelper.clickWhenClickable( driver, submitSelector );
				}
				return await driverHelper.waitTillNotPresent(
					driver,
					userNameSelector,
					this.explicitWaitMS * 2
				);
			} );
	}

	use2FAMethod( twoFAMethod ) {
		let actionSelector;

		if ( twoFAMethod === 'sms' ) {
			actionSelector = By.css( 'button[data-e2e-link="2fa-sms-link"]' );
		} else if ( twoFAMethod === 'otp' ) {
			actionSelector = By.css( 'button[data-e2e-link="2fa-otp-link"]' );
		} else if ( twoFAMethod === 'backup' ) {
			actionSelector = By.css( 'button[data-e2e-link="lost-phone-link"]' );
		}

		if ( actionSelector ) {
			return driverHelper.isElementPresent( this.driver, actionSelector ).then( actionAvailable => {
				if ( actionAvailable ) {
					return driverHelper.clickWhenClickable( this.driver, actionSelector );
				}
			} );
		}
	}

	enter2FACode( twoFACode ) {
		const twoStepCodeSelector = By.css( 'input[name="twoStepCode"]' );
		const submitSelector = By.css( '#wp-submit, button[type="submit"]' );

		driverHelper.setWhenSettable( this.driver, twoStepCodeSelector, twoFACode );
		driverHelper.clickWhenClickable( this.driver, submitSelector );

		return driverHelper.waitTillNotPresent( this.driver, twoStepCodeSelector );
	}

	requestMagicLink( emailAddress ) {
		driverHelper.clickWhenClickable( this.driver, By.css( 'a[data-e2e-link="magic-login-link"]' ) );
		driverHelper.setWhenSettable(
			this.driver,
			By.css( '.magic-login__email-fields input[name="usernameOrEmail"]' ),
			emailAddress
		);
		driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.magic-login__form-action button.is-primary' )
		);
		return driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.magic-login__check-email-image' )
		);
	}

	static getLoginURL() {
		const baseURL = dataHelper.configGet( 'calypsoBaseURL' );
		let loginURL = `${ baseURL }/log-in`;

		// If Calypso is running locally in Docker, force login to actual WordPress.com first
		if ( config.has( 'calypsoDocker' ) && config.get( 'calypsoDocker' ) ) {
			loginURL = `https://wordpress.com/log-in?redirect_to=${ baseURL }`;
		}

		// If we're using a live branch - we need to reload the root page with the branch name
		if ( dataHelper.isRunningOnLiveBranch() ) {
			loginURL = loginURL + '?branch=' + config.get( 'branchName' );
		}

		return loginURL;
	}
}
