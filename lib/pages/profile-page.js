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

	async clickSignOut() {
		this._closeProfileViewOnMobile();

		await driverHelper.clickWhenClickable( this.driver, this.signOutSelector );
		let present = await driverHelper.waitTillNotPresent( this.driver, this.signOutSelector );
		if ( ! present ) {
			await driverHelper.clickWhenClickable( this.driver, this.signOutSelector );
			return await driverHelper.waitTillNotPresent( this.driver, this.signOutSelector );
		}
	}

	chooseManagePurchases() {
		this._closeProfileViewOnMobile();
		return driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.sidebar a[href$="purchases"]' )
		);
	}

	async waitForProfileLinks() {
		const driver = this.driver;
		// Only needed for visdiff screenshots for now
		if ( process.env.VISDIFF ) {
			const linksLoadingSelector = by.css( '.profile-link.is-placeholder' );
			driver.wait(
				async function() {
					let present = await driverHelper.isElementPresent( driver, linksLoadingSelector );
					return ! present;
				},
				this.explicitWaitMS,
				'The profile links placeholder was still present when it should have disappeared by now.'
			);
		}
	}

	_closeProfileViewOnMobile() {
		const self = this;
		if ( driverManager.currentScreenSize() !== 'mobile' ) {
			return;
		}
		driverHelper.isElementPresent( self.driver, by.css( '.focus-content' ) ).then( displayed => {
			if ( displayed ) {
				return driverHelper.clickWhenClickable( self.driver, self.closeProfileViewSelector );
			}
		} );
	}
}
