import { By as by } from 'selenium-webdriver';
import config from 'config';
import BaseContainer from '../../base-container';
import * as driverHelper from '../../driver-helper';

export default class WPAdminLogonPage extends BaseContainer {
	constructor( driver, visit = false ) {
		const jetpackSite = config.get( 'jetpacksite' );
		const wpAdminURL = `https://${jetpackSite}/wp-admin`;
		super( driver, by.css( '#loginform' ), visit, wpAdminURL );
	}

	logonAsJetpackAdmin() {
		const username = config.get( 'jetpacksiteusername' );
		const password = config.get( 'jetpacksitepassword' );
		driverHelper.setWhenSettable( this.driver, by.css( '#user_login' ), username );
		driverHelper.setWhenSettable( this.driver, by.css( '#user_pass' ), password, { secureValue: true } );
		return driverHelper.clickWhenClickable( this.driver, by.css( '#wp-submit' ) );
	}
}
