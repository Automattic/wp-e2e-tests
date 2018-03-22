/** @format */

import { By } from 'selenium-webdriver';
import BaseContainer from '../base-container.js';

import * as driverHelper from '../driver-helper.js';

export default class DisconnectSurveyPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.disconnect-site__survey' ) );
	}

	back() {
		driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.disconnect-site__navigation-links a[href*=manage-connection]' )
		);
	}

	skipSurvey() {
		driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.disconnect-site__navigation-links a[href*=confirm]' )
		);
		return driverHelper.isElementPresent( this.driver, By.css( '.is-primary.is-scary' ) );
	}

	skipSurveyAndDisconnectSite() {
		this.skipSurvey();
		driverHelper.clickWhenClickable( this.driver, By.css( '.is-primary.is-scary' ) );
		return driverHelper.isElementPresent( this.driver, By.css( '.notice.is-success' ) );
	}
}
