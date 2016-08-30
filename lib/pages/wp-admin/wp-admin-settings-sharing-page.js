import { By as by } from 'selenium-webdriver';
import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';

export default class WPAdminSettingsSharingPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '#publicize-form' ) );
	}

	addTwitterConnection() {
		const self = this;
		const addTwitterButtonSelector = by.css( 'a.publicize-add-connection[href*="service=twitter"]' );
		return driverHelper.clickWhenClickable( self.driver, addTwitterButtonSelector );
	}

	removeTwitterIfExists() {
		const self = this;
		const removeTwitterSelector = by.css( 'a[title="Disconnect"][href*="service=twitter"]' );
		return self.driver.isElementPresent( removeTwitterSelector ).then( ( elementIsPresent ) => {
			if ( elementIsPresent ) {
				return self.driver.findElements( removeTwitterSelector ).then( ( elements ) => {
					if ( elements.length > 1 ) {
						throw new Error( 'There are more than 1 twitter account configured - this function can only remove one!' );
					}
					driverHelper.clickWhenClickable( self.driver, removeTwitterSelector );
					self.driver.switchTo().alert().then( function( alert ) {
						alert.accept();
					} );
					return driverHelper.waitTillPresentAndDisplayed( self.driver, by.css( 'div.updated' ) );
				} );
			}
		} );
	}

	twitterAccountShown( twitterUserName ) {
		const selector = by.css( `.publicize-profile-link[href="https://twitter.com/${twitterUserName}"]` );
		return driverHelper.isEventuallyPresentAndDisplayed( this.driver, selector );
	}
}
