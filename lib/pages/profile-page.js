/** @format */

import webdriver from 'selenium-webdriver';

import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';
import * as driverManager from '../driver-manager.js';

const by = webdriver.By;

export default class ProfilePage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.me-profile-settings' ) );
		this.closeProfileViewSelector = by.css( 'header.current-section a' );
		this.signOutSelector = by.css( '.me-sidebar__signout-button,.sidebar__me-signout-button' );
	}

	clickSignOut() {
		this._closeProfileViewOnMobile();

		driverHelper.clickWhenClickable( this.driver, this.signOutSelector );
		return driverHelper.waitTillNotPresent( this.driver, this.signOutSelector ).then(
			() => {},
			() => {
				// Occasionally the click doesn't work on mobile due to the drawer animation, so retry once
				driverHelper.clickWhenClickable( this.driver, this.signOutSelector );
				return driverHelper.waitTillNotPresent( this.driver, this.signOutSelector );
			}
		);
	}

	chooseManagePurchases() {
		this._closeProfileViewOnMobile();
		return driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.sidebar a[href$="purchases"]' )
		);
	}

	waitForProfileLinks() {
		// Only needed for visdiff screenshots for now
		if ( process.env.VISDIFF ) {
			const linksLoadingSelector = by.css( '.profile-link.is-placeholder' );
			return driverHelper.waitTillNotPresent( this.driver, linksLoadingSelector );
		}
	}

	_closeProfileViewOnMobile() {
		if ( driverManager.currentScreenSize() !== 'mobile' ) {
			return;
		}
		return driverHelper.clickIfPresent( this.driver, by.css( '.focus-content' ) );
	}
}
