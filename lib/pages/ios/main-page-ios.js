import BaseContainerMobile from '../../base-container-mobile.js';
import { By } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper.js';

export default class MainPage extends BaseContainerMobile {
	constructor( driver ) {
		super( driver, By.xpath( '//XCUIElementTypeTabBar[@name="Main Navigation"]' ) );
		this.driver = driver;
	}

	clickDotOrgSite( url ) {
		const selector = By.xpath( `//XCUIElementTypeStaticText[@name="${url}"]` );

		return driverHelper.clickWhenClickableMobile( this.driver, selector );
	}
}
