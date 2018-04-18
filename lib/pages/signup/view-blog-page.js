/** @format */

import { By, until } from 'selenium-webdriver';

import BaseContainer from '../../base-container.js';

import * as driverHelper from '../../driver-helper';

export default class ViewBlogPage extends BaseContainer {
	constructor( driver, visit = false, url = null ) {
		super( driver, By.css( '.content-area' ), visit, url );
		this.trampolineSelector = By.css( '#trampoline #trampoline-text' );
	}

	waitForTrampolineWelcomeMessage() {
		this.driver.wait(
			until.elementLocated( this.trampolineSelector ),
			this.explicitWaitMS,
			'Could not locate the trampoline in the expected time'
		);
		let trampolineElement = this.driver.findElement( this.trampolineSelector );
		return this.driver.wait(
			until.elementIsVisible( trampolineElement ),
			this.explicitWaitMS,
			'Could not see the trampoline visible in the expected time'
		);
	}

	isTrampolineWelcomeDisplayed() {
		return driverHelper.isElementPresent( this.driver, this.trampolineSelector );
	}
}
