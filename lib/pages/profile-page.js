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
		return driverHelper.waitTillNotPresent( this.driver, this.signOutSelector ).then( () => {}, () => {
			// Occasionally the click doesn't work on mobile due to the drawer animation, so retry once
			driverHelper.clickWhenClickable( this.driver, this.signOutSelector );
			return driverHelper.waitTillNotPresent( this.driver, this.signOutSelector );
		} );
	}

	chooseManagePurchases() {
		this._closeProfileViewOnMobile();
		return driverHelper.clickWhenClickable( this.driver, by.css( '.sidebar a[href$="purchases"]' ) );
	}

	waitForProfileLinks() {
		const driver = this.driver;
		// Only needed for visdiff screenshots for now
		if ( process.env.VISDIFF ) {
			const linksLoadingSelector = by.css( '.profile-link.is-placeholder' );
			driver.wait( function() {
				return driverHelper.isElementPresent( driver, linksLoadingSelector ).then( function( present ) {
					return ! present;
				} );
			}, this.explicitWaitMS, 'The profile links placeholder was still present when it should have disappeared by now.' );
		}
	}

	_closeProfileViewOnMobile() {
		const self = this;
		if ( driverManager.currentScreenSize() !== 'mobile' ) {
			return;
		}
		driverHelper.isElementPresent( self.driver, by.css( '.focus-content' ) ).then( ( displayed ) => {
			if ( displayed ) {
				return driverHelper.clickWhenClickable( self.driver, self.closeProfileViewSelector );
			}
		} );
	}

}
