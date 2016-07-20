import { By } from 'selenium-webdriver';

import BaseContainer from '../base-container.js';

import * as driverHelper from '../driver-helper.js';

export default class ViewSitePage extends BaseContainer {
	constructor( driver, visit = false, url = null ) {
		super( driver, By.css( '.home' ), visit, url );
	}

	viewFirstPost() {
		return driverHelper.clickWhenClickable( this.driver, By.css( '.entry-title a' ) );
	}

	siteTitle() {
		return this.driver.findElement( By.css( '.site-title' ) ).getText();
	}

	siteTagline() {
		return this.driver.findElement( By.css( '.site-description' ) ).getText();
	}
}
