/** @format */

import { By } from 'selenium-webdriver';

import BaseContainer from '../../base-container.js';

import * as driverHelper from '../../driver-helper.js';

export default class CheckOutThankyouPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.checkout-thank-you' ) );
	}
	clickMySite() {
		return driverHelper.clickWhenClickable( this.driver, By.css( '.my-sites a' ) );
	}
	async goToMyDomain() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.thank-you-card__button' )
		);
	}

	async isPremiumPlan() {
		const premiumPlanCardSelector = By.css( '.plan-thank-you-card.is-premium-plan' );

		return await driverHelper.isElementPresent( this.driver, premiumPlanCardSelector );
	}
}
