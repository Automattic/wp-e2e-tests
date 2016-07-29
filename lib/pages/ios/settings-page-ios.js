import BaseContainerMobile from '../../base-container-mobile.js';
import * as driverHelper from '../../driver-helper.js';
import { By } from 'selenium-webdriver';

export default class SettingsPage extends BaseContainerMobile {
	constructor( driver ) {
		super( driver, By.xpath( '//UIAStaticText[@name="Settings"]' ) );
	}

	removeSite() {
		var driver = this.driver;

		const removeSiteButtonSelector = By.xpath( '//UIATableCell[@name="Remove Site"]' );
		const confirmationSelector = By.xpath( '//UIAButton[@name="Remove Site"]' );

		return driverHelper.clickWhenClickableMobile( driver, removeSiteButtonSelector ).then( function() {
			return driverHelper.clickWhenClickableMobile( driver, confirmationSelector );
		} );
	}
}
