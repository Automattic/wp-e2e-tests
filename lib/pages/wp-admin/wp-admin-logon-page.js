import { By as by } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper';
import config from 'config';

import GenericLogonPage from '../login-page';

export default class WPAdminLogonPage extends GenericLogonPage {
	constructor( driver, wpAdminUrl, { visit = false, forceStandardLogon = false } = {} ) {
		super( driver, visit, wpAdminUrl );
		if ( forceStandardLogon === true ) {
			this.ensureWPAdminStandardLogonShown();
		}
	}

	ensureWPAdminStandardLogonShown() {
		const self = this;
		self.driver.findElement( by.tagName( 'body' ) ).getAttribute( 'class' ).then( ( bodyClasses ) => {
			if ( bodyClasses.indexOf( 'jetpack-sso-form-display' ) > -1 ) {
				return driverHelper.clickWhenClickable( self.driver, by.css( '.jetpack-sso-toggle.wpcom' ) );
			}
		} );
		return self.waitForPage();
	}

	logonSSO() {
		const selector = by.css( '.jetpack-sso.button' );

		return driverHelper.clickWhenClickable( this.driver, selector );
	}

	logonStandard( username, password ) {
		driverHelper.setWhenSettable( this.driver, by.css( '#user_login' ), username );
		driverHelper.setWhenSettable( this.driver, by.css( '#user_pass' ), password );
		driverHelper.clickWhenClickable( this.driver, by.css( '.submit input[type="submit"]' ) );
		return driverHelper.waitTillPresentAndDisplayed( this.driver, by.css( '#wpadminbar' ) );
	}
}
