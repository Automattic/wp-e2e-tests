/** @format */

import { By as by } from 'selenium-webdriver';

import AsyncBaseContainer from '../async-base-container';

import * as driverHelper from '../driver-helper.js';

export default class ViewSitePage extends AsyncBaseContainer {
	constructor( driver, url = null ) {
		super( driver, by.css( 'body' ), url );
	}

	async _postInit() {
		// Workaround for https://github.com/Automattic/wp-e2e-tests/issues/1302
		await this.driver.navigate().refresh();
		await driverHelper.waitTillPresentAndDisplayed( this.driver, by.css( '.home' ) );
	}

	async viewFirstPost() {
		return await driverHelper.clickWhenClickable( this.driver, by.css( '.entry-title a' ) );
	}

	async siteTitle() {
		return await this.driver.findElement( by.css( '.site-title' ) ).getText();
	}

	async siteTagline() {
		return await this.driver.findElement( by.css( '.site-description' ) ).getText();
	}
}
