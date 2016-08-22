import { By as by } from 'selenium-webdriver';
import config from 'config';
import BaseContainer from '../../base-container';
import * as driverHelper from '../../driver-helper';

export default class WPAdminLogonPage extends BaseContainer {
	constructor( driver, visit = false ) {
		const jetpackSite = config.get( 'jetpacksite' );
		const wpAdminURL = `https://${jetpackSite}/wp-admin`;
		super( driver, by.css( '#loginform' ), visit, wpAdminURL );
		this.ensureWPAdminStandardLogonShown();
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

	logonAsPressableAdmin() {
		const username = config.get( 'pressablesiteusername' );
		const password = config.get( 'pressablesitepassword' );
		driverHelper.setWhenSettable( this.driver, by.css( '#user_login' ), username );
		driverHelper.setWhenSettable( this.driver, by.css( '#user_pass' ), password, { secureValue: true } );
		return driverHelper.clickWhenClickable( this.driver, by.css( '#wp-submit' ) );
	}
}
