import { By } from 'selenium-webdriver';
import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';

export default class WPAdminDashboardPage extends BaseContainer {
	constructor( driver, url ) {
		const wpAdminURL = `http://${url}/wp-admin`;

		super( driver, By.css( '#wpbody .welcome-panel-content' ), true, wpAdminURL );
	}

	logout() {
		const accountBarSelector = By.css( '#wp-admin-bar-my-account' );
		const logoutOptionSelector = By.css( '#wp-admin-bar-logout' );
		return this.driver.findElement( accountBarSelector ).then( element => {
			return this.driver.actions().mouseMove( element ).perform().then( () => {
				return driverHelper.clickWhenClickable( this.driver, logoutOptionSelector );
			} );
		} );
	}
}
