import BaseContainerMobile from '../../base-container-mobile.js';
import { By } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper.js';

export default class PostPublishedPage extends BaseContainerMobile {
	constructor( driver ) {
		super( driver, By.xpath( '//XCUIElementTypeButton[@name="View Post"]' ) );
		this.driver = driver;
	}

	clickDone() {
		const selector = By.xpath( `//XCUIElementTypeButton[@name="Done"]` );

		return driverHelper.clickWhenClickableMobile( this.driver, selector );
	}
}
