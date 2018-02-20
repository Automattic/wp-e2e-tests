import config from 'config';
import { By } from 'selenium-webdriver';

import BaseContainer from '../../base-container';
import * as driverHelper from '../../driver-helper';

const explicitWaitMS = config.get( 'explicitWaitMS' );

export default class PressableSiteSettingsPage extends BaseContainer {
	constructor( driver ) {
		const loadingSelector = By.css( 'img.loading-image' );

		super( driver, By.css( '.site-show-sections' ) );
		this.url = this.driver.getCurrentUrl();
		driverHelper.waitTillNotPresent( this.driver, loadingSelector, explicitWaitMS * 4 );
	}

	gotoWPAdmin() {
		const buttonSelector = By.css( '.site-show-bar-wp-btn' );
		return driverHelper.followLinkWhenFollowable( this.driver, buttonSelector );
	}

	activateJetpackPremium() {
		const activationLink = By.css( '.jetpack-activation-notice a' );
		return driverHelper.clickWhenClickable( this.driver, activationLink );

		// let driver = this.driver;

		// return driver.wait( () => {
		// 	return driver.get( this.url )
		// 	.then( () => ( driver.findElement( activationLink ) ) )
		// 	.then( element => {
		// 		return element.isDisplayed()
		// 		.then( ( () => true ), ( () => false ) );
		// 	}, ( () => false ) );
		// } );
	}

	deleteSite() {
		const deleteButton = By.css( '.delete-destroy a' );
		const confirmButton = By.css( '.modal .confirm' );

		return driverHelper.clickWhenClickable( this.driver, deleteButton )
		.then( () => driverHelper.clickWhenClickable( this.driver, confirmButton ) );
	}
}
