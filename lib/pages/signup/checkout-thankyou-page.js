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
	goToMyDomain() {
		return driverHelper.clickWhenClickable( this.driver, By.css( '.thank-you-card__button' ) );
	}
}
