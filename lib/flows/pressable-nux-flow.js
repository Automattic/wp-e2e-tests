import { By } from 'selenium-webdriver';

import * as driverHelper from '../driver-helper';
import WPAdminLogonPage from '../pages/wp-admin/wp-admin-logon-page';

export default class PressableNUXFlow {
	constructor( driver ) {
		this.driver = driver;
	}

	addSiteCredentials() {
		const shareCredentialsSelector = By.css( '.creds-permission__card button' );
		const continueSelector = By.css( 'a.creds-complete__button' );

		return driverHelper.waitTillPresentAndDisplayed( this.driver, shareCredentialsSelector )
		.then( () => driverHelper.clickWhenClickable( this.driver, shareCredentialsSelector ) )
		.then( () => driverHelper.clickWhenClickable( this.driver, continueSelector ) )
		.then( () => {
			let loginPage = new WPAdminLogonPage( this.driver );
			return loginPage.logonSSO();
		} );
	}
}
