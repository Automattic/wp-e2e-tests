import webdriver from 'selenium-webdriver';
import slack from 'slack-notify';
import config from 'config';

import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

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
			const message = `The signout page is still being shown despite signing out - trying again now to signout`;
			console.log( message );
			if ( config.has( 'slackHook' ) ) {
				let slackClient = slack( config.get( 'slackHook' ) );
				slackClient.send( {
					icon_emoji: ':a8c:',
					text: message,
					username: 'WebDriverJS'
				} );
			}
			driverHelper.clickWhenClickable( self.driver, self.signOutSelector, self.explicitWaitMS );
		} );
	}
}
