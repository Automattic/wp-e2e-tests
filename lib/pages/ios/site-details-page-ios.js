import BaseContainerMobile from '../../base-container-mobile.js';
import { By } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper.js';

export default class SiteDetailsPage extends BaseContainerMobile {
	constructor( driver ) {
		super( driver, By.xpath( '//UIAButton[@name="Switch Site"]' ) );
	}

	clickSettings() {
		const selector = By.xpath( '//UIATableCell[@name="Settings"]' );

		return driverHelper.clickWhenClickableMobile( this.driver, selector );
	}
}
