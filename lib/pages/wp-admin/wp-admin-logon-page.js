import { By as by } from 'selenium-webdriver';
import config from 'config';
import BaseContainer from '../../base-container.js';

export default class WPAdminLogonPage extends BaseContainer {
	constructor( driver, visit = false ) {
		const jetpackSite = config.get( 'jetpacksite' );
		const wpAdminURL = `https://${jetpackSite}/wp-admin`;
		super( driver, by.css( '#loginform' ), visit, wpAdminURL );
	}

	logonAsJetpackAdmin() {
		const username = config.get( 'jetpacksiteusername' );
		const password = config.get( 'jetpacksitepassword' );
		this.driver.findElement( by.css( '#user_login' ) ).sendKeys( username );
		this.driver.findElement( by.css( '#user_pass' ) ).sendKeys( password );
		return this.driver.findElement( by.css( '#wp-submit' ) ).click();
	}
}
