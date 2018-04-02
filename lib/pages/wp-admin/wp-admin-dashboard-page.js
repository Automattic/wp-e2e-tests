/** @format */

import { By } from 'selenium-webdriver';
import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';

export default class WPAdminDashboardPage extends BaseContainer {
	constructor( driver, url ) {
		let visit = false;
		let wpAdminURL;

		if ( url ) {
			url = url.replace( /^https?:\/\//, '' ).replace( /\/wp-admin/, '' );
			wpAdminURL = `https://${ url }/wp-admin`;
			visit = true;
		}

		super( driver, By.css( '#wpbody #wpbody-content' ), visit, wpAdminURL );
	}

	logout() {
		const accountBarSelector = By.css( '#wp-admin-bar-my-account' );
		const logoutOptionSelector = By.css( '#wp-admin-bar-logout' );
		return this.driver.findElement( accountBarSelector ).then( element => {
			return this.driver
				.actions()
				.mouseMove( element )
				.perform()
				.then( () => {
					return driverHelper.clickWhenClickable( this.driver, logoutOptionSelector );
				} );
		} );
	}

	isJITMessageDisplayed( type ) {
		const jitmActionSelector = By.css( `.jitm-banner__action a[data-module="${ type }"]` );

		return driverHelper.isEventuallyPresentAndDisplayed( this.driver, jitmActionSelector, 1000 );
	}
}
