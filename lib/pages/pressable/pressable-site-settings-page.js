import { By } from 'selenium-webdriver';

import BaseContainer from '../../base-container';
import * as driverHelper from '../../driver-helper';

export default class PressableSiteSettingsPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.site-show-sections' ) );
		this.url = this.driver.getCurrentUrl();
	}

	gotoWPAdmin() {
		const buttonSelector = By.css( '.site-show-bar-wp-btn' );
		// return driverHelper.clickWhenClickable( this.driver, buttonSelector );
		return driverHelper.followLinkWhenFollowable( this.driver, buttonSelector );
	}

	activateJetpackPremium() {
		// NOT WORKING :(
		const activationLink = By.css( '.jetpack-activation-notice a' );
		// return driverHelper.clickWhenClickable( this.driver, activationLink );
		let driver = this.driver;

		return driver.wait( () => {
			return driver.get( this.url )
			.then( () => ( driver.findElement( activationLink ) ) )
			.then( element => {
				return element.isDisplayed()
				.then( ( () => true ), ( () => false ) );
			}, ( () => false ) );
		} );
	}
}
