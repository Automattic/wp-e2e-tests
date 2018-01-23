import webdriver from 'selenium-webdriver';

import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

const by = webdriver.By;

export default class ProfilePage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.me-profile-settings' ) );
		this.closeProfileViewSelector = by.css( 'header.current-section a' );
		this.signOutSelector = by.css( '.me-sidebar__signout-button' );
	}

	clickSignOut() {
		this._closeProfileViewOnMobile();

		driverHelper.clickWhenClickable( this.driver, this.signOutSelector );
		return driverHelper.waitTillNotPresent( this.driver, this.signOutSelector );
	}

	chooseManagePurchases() {
		this._closeProfileViewOnMobile();
		return driverHelper.clickWhenClickable( this.driver, by.css( '.sidebar a[href$="purchases"]' ) );
	}

	_closeProfileViewOnMobile() {
		const self = this;
		driverHelper.isElementPresent( self.driver, by.css( '.focus-content' ) ).then( ( displayed ) => {
			if ( displayed ) {
				return driverHelper.clickWhenClickable( self.driver, self.closeProfileViewSelector );
			}
		} );
	}

}
