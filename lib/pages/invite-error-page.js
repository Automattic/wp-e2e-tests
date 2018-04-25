/** @format */

import By from 'selenium-webdriver';
import BaseContainer from '../base-container.js';

import * as DriverHelper from '../driver-helper.js';

export default class InviteErrorPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.empty-content__illustration' ) );
		this.inviteErrorTitleSelector = By.css( '.empty-content__title' );
		this.inviteErrorMessageSelector = By.css( '.empty-content__line' );
	}

	inviteErrorTitleDisplayed() {
		return DriverHelper.isElementPresent( this.driver, this.inviteErrorTitleSelector );
	}
}
