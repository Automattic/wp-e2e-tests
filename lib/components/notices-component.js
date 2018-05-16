/** @format */

import { By, until } from 'selenium-webdriver';

import config from 'config';

import BaseContainer from '../base-container.js';

export default class NoticesComponent extends BaseContainer {
	constructor( driver ) {
		const longExplicitWaitMS = config.get( 'explicitWaitMS' ) * 3;
		const expectedElementSelector = By.css( '#notices' );
		driver.wait(
			until.elementLocated( expectedElementSelector ),
			longExplicitWaitMS,
			`Could not locate the notices component after: ${ longExplicitWaitMS }ms`
		);
		super( driver, expectedElementSelector );
	}

	async inviteMessageTitle() {
		return await this.driver.findElement( By.css( '.invite-message__title' ) ).getText();
	}

	async followMessageTitle() {
		return await this.driver.findElement( By.css( '#notices .notice__text' ) ).getText();
	}
}
