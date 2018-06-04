/** @format */

import { By } from 'selenium-webdriver';
import BaseContainer from '../base-container.js';

import * as DriverHelper from '../driver-helper.js';

export default class DisconnectSurveyPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.disconnect-site__survey' ) );
	}

	back() {
		DriverHelper.clickWhenClickable(
			this.driver,
			By.css( '.disconnect-site__navigation-links a[href*=manage-connection]' )
		);
	}

	skipSurvey() {
		DriverHelper.clickWhenClickable(
			this.driver,
			By.css( '.disconnect-site__navigation-links a[href*=confirm]' )
		);
		return DriverHelper.isElementPresent( this.driver, By.css( '.is-primary.is-scary' ) );
	}

	async skipSurveyAndDisconnectSite() {
		this.skipSurvey();
		await DriverHelper.clickWhenClickable( this.driver, By.css( '.is-primary.is-scary' ) );
		return await DriverHelper.isElementPresent( this.driver, By.css( '.notice.is-success' ) );
	}
}
