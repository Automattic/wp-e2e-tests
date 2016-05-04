import { By } from 'selenium-webdriver';

import BaseContainer from '../../base-container.js';

export default class SignupProcessingPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.step-header__title' ) );
	}
	waitForPageToDisappear() {
		const driver = this.driver;
		const expectedElementSelector = this.expectedElementSelector;
		return driver.wait( function() {
			return driver.isElementPresent( expectedElementSelector ).then( function( present ) {
				return ! present;
			}, function() {
				return false;
			} );
		}, this.explicitWaitMS * 4, 'Sign up processing page is still visible when it shouldn\'t be' );
	}
}
