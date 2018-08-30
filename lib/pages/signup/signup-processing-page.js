/** @format */

import { By } from 'selenium-webdriver';

import AsyncBaseContainer from '../../async-base-container';

import * as SlackNotifier from '../../slack-notifier';
import * as driverHelper from '../../driver-helper';

export default class SignupProcessingPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.signup-processing__content' ) );
		this.continueButtonSelector = By.css( 'button.email-confirmation__button:not([disabled])' );
	}

	async continueAlong() {
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			this.continueButtonSelector,
			this.explicitWaitMS * 3
		);
		await driverHelper.clickWhenClickable( this.driver, this.continueButtonSelector );
		return await this.waitToDisappear();
	}

	async waitToDisappear() {
		await driverHelper.waitTillNotPresent(
			this.driver,
			this.expectedElementSelector,
			this.explicitWaitMS * 3
		);
		const url = await this.driver.getCurrentUrl();
		if ( url.indexOf( 'log-in' ) > -1 ) {
			const referredURL = unescape( url.split( '=' )[ 1 ] );
			SlackNotifier.warn(
				`Sign up was redirected to log-in page - redirecting back now to referred URL: '${ referredURL }'`
			);
			await this.driver.get( referredURL );
		}
	}

	static async hideFloatiesinIE11( driver ) {
		const floatiesStringSelector = '.signup-processing-screen__floaties';

		// Hides the floating background on signup that causes issues with Selenium/SauceLabs getting page loaded status
		if ( global.browserName === 'Internet Explorer' ) {
			driver.executeScript(
				'document.querySelector( "' + floatiesStringSelector + '" ).style.display = "none";'
			);
		}
	}
}
