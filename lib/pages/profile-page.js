import webdriver from 'selenium-webdriver';

import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';
import * as SlackNotifier from '../slack-notifier.js';

const by = webdriver.By;

export default class ProfilePage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.className( 'me-profile-settings' ) );
		this.closeProfileViewSelector = by.css( 'header.current-section' );
		this.signOutSelector = by.css( '.me-sidebar__signout-button' );
	}
	clickSignOut() {
		let self = this;

		this.closeProfileViewElement = this.driver.findElement( self.closeProfileViewSelector );
		this.closeProfileViewElement.isDisplayed().then( function( displayed ) {
			if ( displayed ) {
				return driverHelper.clickWhenClickable( self.driver, self.closeProfileViewSelector, self.explicitWaitMS );
			}
		} );
		driverHelper.clickWhenClickable( self.driver, self.signOutSelector, self.explicitWaitMS );

		return self.driver.wait( function() {
			return self.driver.isElementPresent( self.signOutSelector ).then( function( present ) {
				return ! present;
			}, function() {
				return false;
			} );
		}, self.explicitWaitMS ).then( function() { }, function( error ) {
			const message = `The sign out page is still being shown despite signing out - trying again now to sign out`;
			SlackNotifier.warn( message );
			driverHelper.clickWhenClickable( self.driver, self.signOutSelector, self.explicitWaitMS );
		} );
	}
}
