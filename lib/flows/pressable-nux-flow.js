import { By } from 'selenium-webdriver';
import config from 'config';

import * as driverHelper from '../driver-helper';
import WPAdminLogonPage from '../pages/wp-admin/wp-admin-logon-page';

const explicitWaitMS = config.get( 'explicitWaitMS' );

export default class PressableNUXFlow {
	constructor( driver ) {
		this.driver = driver;
	}

	addSiteCredentials() {
		const shareCredentialsSelector = By.css( '.creds-permission__card button' );
		const continueSelector = By.css( 'a.creds-complete__button' );
		const successNoticeSelector = By.css( '#notices .is-success .gridicons-checkmark' );

		return driverHelper.waitTillPresentAndDisplayed( this.driver, shareCredentialsSelector, explicitWaitMS * 2 )
		.then( () => driverHelper.clickWhenClickable( this.driver, shareCredentialsSelector ) )
		.then( () => driverHelper.waitTillPresentAndDisplayed( this.driver, successNoticeSelector ) )
		.then( () => driverHelper.clickWhenClickable( this.driver, continueSelector ) )
		.then( () => {
			let loginPage = new WPAdminLogonPage( this.driver );
			return loginPage.logonSSO();
		} );
	}
}
