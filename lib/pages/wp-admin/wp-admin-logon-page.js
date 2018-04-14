/** @format */

import { By as by } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper';

import GenericLogonPage from '../login-page';

export default class WPAdminLogonPage extends GenericLogonPage {
	constructor( driver, url, { visit = false, forceStandardLogon = false } = {} ) {
		let wpAdminURL;

		if ( url ) {
			url = url.replace( /^https?:\/\//, '' ).replace( /\/wp-admin/, '' );
			wpAdminURL = `http://${ url }/wp-admin`;
		}

		super( driver, visit, wpAdminURL );
		if ( forceStandardLogon === true ) {
			this.ensureWPAdminStandardLogonShown();
		}
	}

	ensureWPAdminStandardLogonShown() {
		const self = this;
		self.driver
			.findElement( by.tagName( 'body' ) )
			.getAttribute( 'class' )
			.then( bodyClasses => {
				if ( bodyClasses.indexOf( 'jetpack-sso-form-display' ) > -1 ) {
					return driverHelper.clickWhenClickable(
						self.driver,
						by.css( '.jetpack-sso-toggle.wpcom' )
					);
				}
			} );
		return self.waitForPage();
	}

	async logonSSO() {
		const selector = by.css( '.jetpack-sso.button' );

		return await driverHelper.clickWhenClickable( this.driver, selector );
	}
}
