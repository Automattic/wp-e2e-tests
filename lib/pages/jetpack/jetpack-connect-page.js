/** @format */
import { By } from 'selenium-webdriver';
import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';

export default class JetpackConnectPage extends BaseContainer {
	constructor( driver, { overrideABTests = true } = {} ) {
		super( driver, By.css( '.jetpack-connect__main' ) );
		if ( overrideABTests === true ) {
			driver.getCurrentUrl().then( urlDisplayed => {
				this.setABTestControlGroupsInLocalStorage( urlDisplayed );
			} );
		}
	}

	async addSiteUrl( url ) {
		let urlInputSelector = By.css( '.jetpack-connect__site-address-container #siteUrl' );
		let confirmButtonSelector = By.css(
			'.jetpack-connect__main .jetpack-connect__connect-button:not([disabled])'
		);

		await driverHelper.setWhenSettable( this.driver, urlInputSelector, url );
		return await driverHelper.clickWhenClickable( this.driver, confirmButtonSelector );
	}
}
