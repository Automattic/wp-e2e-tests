import config from 'config';
import { By } from 'selenium-webdriver';
import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';

const explicitWaitMS = config.get( 'explicitWaitMS' );

export default class ActivityPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.activity-log__wrapper' ) );
	}

	addSiteCredentials() {
		const addCredentialsSelector = By.css( "a[href*='start/rewind-auto-config']" );
		const shareCredentialsSelector = By.css( '.creds-permission__card button' );
		const viewActivitySelector = By.css( '.rewind-were-backing__card a' );
		const cloudIconSelector = By.css( '.activity-log-item__activity-icon .gridicons-cloud' );
		const rewindButtonSelector = By.css( '.foldable-card__summary-expanded .gridicons-history' );

		return driverHelper.clickWhenClickable( this.driver, addCredentialsSelector )
		.then( () => driverHelper.clickWhenClickable( this.driver, shareCredentialsSelector ) )
		.then( () => driverHelper.clickWhenClickable( this.driver, viewActivitySelector ) )
		.then( () => driverHelper.waitTillPresentAndDisplayed( this.driver, cloudIconSelector, explicitWaitMS * 7 ) )
		.then( () => this.driver.getCurrentUrl() )
		.then( url => this.driver.get( url ) )
		.then( () => driverHelper.waitTillPresentAndDisplayed( this.driver, rewindButtonSelector ) );
	}
}
