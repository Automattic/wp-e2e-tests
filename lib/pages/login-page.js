/** @format */

import { By } from 'selenium-webdriver';
import { Key } from 'selenium-webdriver';
import config from 'config';

import AsyncBaseContainer from '../async-base-container';

import * as driverHelper from '../driver-helper.js';
import * as dataHelper from '../data-helper';
import * as SlackNotifier from '../slack-notifier';

// This is the Calypso WordPress.com login page
// For the wp-admin login page see /wp-admin/wp-admin-logon-page
export default class LoginPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.wp-login__container' ), LoginPage.getLoginURL() );
	}

	async login( username, password, { retry = true } = {} ) {
		const driver = this.driver;
		const userNameSelector = By.css( '#usernameOrEmail' );
		const passwordSelector = By.css( '#password' );
		const submitSelector = By.css( 'button[type="submit"]' );

		await driverHelper.waitTillPresentAndDisplayed( driver, userNameSelector );
		await driverHelper.setWhenSettable( driver, userNameSelector, username );
		await driver.findElement( userNameSelector ).sendKeys( Key.ENTER );

		await driverHelper.setWhenSettable( driver, passwordSelector, password, {
			secureValue: true,
		} );
		await driverHelper.clickWhenClickable( driver, submitSelector );

		if ( retry === true ) {
			try {
				await driverHelper.waitTillNotPresent( driver, userNameSelector );
			} catch ( e ) {
				await SlackNotifier.warn( `There login didn't work as expected: '${ e }'`, {
					suppressDuplicateMessages: true,
				} );
				return await this.login( username, password, { retry: false } );
			}
		}
		return await driverHelper.waitTillNotPresent( driver, userNameSelector );
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

	async requestMagicLink( emailAddress ) {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'a[data-e2e-link="magic-login-link"]' )
		);
		await driverHelper.setWhenSettable(
			this.driver,
			By.css( '.magic-login__email-fields input[name="usernameOrEmail"]' ),
			emailAddress
		);
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.magic-login__form-action button.is-primary' )
		);
		return await driverHelper.waitTillPresentAndDisplayed(
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
