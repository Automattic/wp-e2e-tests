/** @format */

import { By as by } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper';

import AsyncBaseContainer from '../../async-base-container';

export default class WPAdminLogonPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		let wpAdminURL = null;
		if ( url ) {
			url = url.replace( /^https?:\/\//, '' ).replace( /\/wp-admin/, '' );
			wpAdminURL = `http://${ url }/wp-admin`;
		}
		super( driver, by.css( '.login' ), wpAdminURL );
	}

	async logonSSO() {
		return driverHelper.clickWhenClickable( this.driver, by.css( '.jetpack-sso.button' ) );
	}
}
