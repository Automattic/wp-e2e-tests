/** @format */

import { By, Key } from 'selenium-webdriver';
import config from 'config';

import AsyncBaseContainer from '../async-base-container';

import * as driverHelper from '../driver-helper.js';
import * as dataHelper from '../data-helper';

// This is the Calypso WordPress.com login page
// For the wp-admin login page see /wp-admin/wp-admin-logon-page
export default class LoginPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.wp-login__container' ), LoginPage.getLoginURL() );
	}

	async login( username, password ) {
		const driver = this.driver;
		const userNameSelector = By.css( '#usernameOrEmail' );
		const userNameDisabledSelector = By.css( '#usernameOrEmail[disabled]' );

		const passwordSelector = By.css( '#password' );
		const submitSelector = By.css( 'button[type="submit"]' );

		await driverHelper.waitTillPresentAndDisplayed( driver, userNameSelector );
		await driverHelper.setWhenSettable( driver, userNameSelector, username );
		await driver.findElement( userNameSelector ).sendKeys( Key.ENTER );
		await driverHelper.waitTillPresentAndDisplayed( driver, userNameDisabledSelector );

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
		let loginURL = `${ dataHelper.configGet( 'calypsoBaseURL' ) }/log-in`;

		// If we're using a live branch - we need to reload the root page with the branch name
		if ( dataHelper.isRunningOnLiveBranch() ) {
			loginURL = loginURL + '?branch=' + config.get( 'branchName' );
		}
		return loginURL;
	}
}
