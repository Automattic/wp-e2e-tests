import config from 'config';
import { By } from 'selenium-webdriver';

import BaseContainer from '../../base-container';
import * as driverHelper from '../../driver-helper';

const explicitWaitMS = config.get( 'explicitWaitMS' );

export default class PressableSiteSettingsPage extends BaseContainer {
	constructor( driver ) {
		const loadingSelector = By.css( '.activating img.loading-image' );

		super( driver, By.css( '.site-show-sections' ) );
		driverHelper.waitTillNotPresent( this.driver, loadingSelector, explicitWaitMS * 4 );
	}

	gotoWPAdmin() {
		const buttonSelector = By.css( '.site-show-bar-wp-btn' );
		return driverHelper.followLinkWhenFollowable( this.driver, buttonSelector );
	}

	activateJetpackPremium() {
		const activationLink = By.css( '.jetpack-activation-notice a[href*="/jetpack_partnership"]' );
		return this.driver.sleep( 1000 ) // Button isn't clickable right away
		.then( () => driverHelper.clickWhenClickable( this.driver, activationLink ) );
	}

	deleteSite() {
		const deleteButton = By.css( '.delete-destroy a' );
		const confirmButton = By.css( '.modal .confirm' );

		return driverHelper.clickWhenClickable( this.driver, deleteButton )
		.then( () => driverHelper.clickWhenClickable( this.driver, confirmButton ) );
	}
}
