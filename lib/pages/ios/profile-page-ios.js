import BaseContainerMobile from '../../base-container-mobile.js';
import * as driverHelper from '../../driver-helper.js';

import { By } from 'selenium-webdriver';

export default class ProfilePage extends BaseContainerMobile {
	constructor( driver ) {
		super( driver, By.xpath( '//UIANavigationBar[@name="Me"]' ) );
	}

	disconnectFromWPCom() {
		var driver = this.driver;
		const disconnectButtonSelector = By.xpath( '//UIAStaticText[@name="Disconnect from WordPress.com"]' );
		const disconnectConfirmationSelector = By.xpath( '//UIAButton[@name="Disconnect"]' );

		return driverHelper.clickWhenClickableMobile( driver, disconnectButtonSelector ).then( function() {
			return driverHelper.clickWhenClickableMobile( driver, disconnectConfirmationSelector );
		} );
	}
}
