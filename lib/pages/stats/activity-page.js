/** @format */

import { By } from 'selenium-webdriver';

import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper';

export default class ActivityPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.activity-log__wrapper' ) );
	}

	async postTitleDisplayed( postTitle ) {
		const driver = this.driver;
		return driver.wait( () => {
			driver.navigate().refresh();
			return driverHelper
				.isElementPresent(
					driver,
					By.xpath(
						`//div[@class='activity-log-item__description-content']//a//em[text()='${ postTitle }']`
					)
				)
				.then( present => {
					return present;
				} );
		}, this.explicitWaitMS * 2 );
	}
}
