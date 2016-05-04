import webdriver from 'selenium-webdriver';
import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

const by = webdriver.By;

export default class ProfilePage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.className( 'me-profile-settings' ) );
	}
	clickSignOut() {
		const closeProfileViewSelector = by.css( 'header.current-section' );
		const signOutSelector = by.css( '.me-sidebar__signout-button' );
		let driver = this.driver;
		let explicitWaitMS = this.explicitWaitMS;
		var closeProfileViewElement = this.driver.findElement( closeProfileViewSelector );
		closeProfileViewElement.isDisplayed().then( function( displayed ) {
			if ( displayed ) {
				return driverHelper.clickWhenClickable( driver, closeProfileViewSelector, explicitWaitMS );
			}
		} );
		this.driver.wait( webdriver.until.elementLocated( signOutSelector ), this.explicitWaitMS, 'Could not locate the sign out element' );
		let signOutElement = this.driver.findElement( signOutSelector );
		this.driver.wait( webdriver.until.elementIsVisible( signOutElement ), this.explicitWaitMS, 'Could not see the sign out element as visible' );
		return driverHelper.clickWhenClickable( this.driver, signOutSelector, this.explicitWaitMS );
	}
}
