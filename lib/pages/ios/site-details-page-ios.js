import BaseContainerMobile from '../../base-container-mobile.js';
import { By } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper.js';

export default class SiteDetailsPage extends BaseContainerMobile {
	constructor( driver ) {
		super( driver, By.xpath( '//XCUIElementTypeButton[@name="Switch Site"]' ) );
	}

	clickMenuItem( name ) {
		const selector = By.xpath( `//XCUIElementTypeStaticText[@name="${name}"]` );

		return driverHelper.clickWhenClickableMobile( this.driver, selector );
	}
}
