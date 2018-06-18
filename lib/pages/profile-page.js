/** @format */

import webdriver from 'selenium-webdriver';

import AsyncBaseContainer from '../async-base-container';

import * as driverHelper from '../driver-helper.js';
import * as driverManager from '../driver-manager.js';

const by = webdriver.By;

export default class ProfilePage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.me-profile-settings' ) );
	}

	async clickSignOut() {
		await this._closeProfileViewOnMobile();
		await driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.me-sidebar__signout-button,.sidebar__me-signout-button' )
		);
		return driverHelper.waitTillNotPresent( this.driver, this.signOutSelector ).then(
			() => {},
			() => {
				// Occasionally the click doesn't work on mobile due to the drawer animation, so retry once
				driverHelper.clickWhenClickable( this.driver, this.signOutSelector );
				return driverHelper.waitTillNotPresent( this.driver, this.signOutSelector );
			}
		);
	}

	async chooseManagePurchases() {
		await this._closeProfileViewOnMobile();
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.sidebar a[href$="purchases"]' )
		);
	}

	async chooseAccountSettings() {
		await this._closeProfileViewOnMobile();
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.sidebar a[href$="account"]' )
		);
	}

	async waitForProfileLinks() {
		// Only needed for visdiff screenshots for now
		if ( process.env.VISDIFF ) {
			return await driverHelper.waitTillNotPresent(
				this.driver,
				by.css( '.profile-link.is-placeholder' )
			);
		}
	}

	async _closeProfileViewOnMobile() {
		if ( driverManager.currentScreenSize() !== 'mobile' ) {
			return;
		}
		let displayed = await driverHelper.isElementPresent( this.driver, by.css( '.focus-content' ) );
		if ( displayed ) {
			return await driverHelper.clickWhenClickable(
				this.driver,
				by.css( 'header.current-section a' )
			);
		}
	}
}
