/** @format */

import config from 'config';
import { By } from 'selenium-webdriver';
import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';

const explicitWaitMS = config.get( 'explicitWaitMS' );

export default class ActivityPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.activity-log-day' ) );
	}

	addSiteCredentials() {
		const addCredentialsSelector = By.css( "a[href*='start/rewind-auto-config']" );
		const shareCredentialsSelector = By.css( '.creds-permission__card button' );
		const viewActivitySelector = By.css( '.rewind-were-backing__card a' );
		const cloudIconSelector = By.css( '.activity-log-item__activity-icon .gridicons-cloud' );
		const rewindButtonSelector = By.css( '.foldable-card__summary-expanded .gridicons-history' );

		return driverHelper
			.clickWhenClickable( this.driver, addCredentialsSelector )
			.then( () => driverHelper.clickWhenClickable( this.driver, shareCredentialsSelector ) )
			.then( () => driverHelper.clickWhenClickable( this.driver, viewActivitySelector ) )
			.then( () =>
				driverHelper.waitTillPresentAndDisplayed(
					this.driver,
					cloudIconSelector,
					explicitWaitMS * 7
				)
			)
			.then( () => this.driver.getCurrentUrl() )
			.then( url => this.driver.get( url ) )
			.then( () => driverHelper.waitTillPresentAndDisplayed( this.driver, rewindButtonSelector ) );
	}

	waitUntilBackupCompleted() {
		const cloudIconSelector = By.css( '.activity-log-item__activity-icon .gridicons-cloud' );
		const rewindButtonSelector = By.css( '.foldable-card__summary-expanded .gridicons-history' );

		return () =>
			driverHelper
				.waitTillPresentAndDisplayed( this.driver, cloudIconSelector )
				.then( () => this.driver.getCurrentUrl() )
				.then( url => this.driver.get( url ) )
				.then( () =>
					driverHelper.waitTillPresentAndDisplayed( this.driver, rewindButtonSelector )
				);
	}

	expandDayCard( count = 0 ) {
		const dayCardSelector = By.css( '.activity-log-day' );
		let element;
		return driverHelper.isElementPresent( this.driver, dayCardSelector ).then( found => {
			if ( ! found ) {
				return;
			}
			return this.driver
				.findElements( dayCardSelector )
				.then( elements => {
					element = elements[ count ];
					return element.getAttribute( 'class' );
				} )
				.then( classNames => {
					if ( classNames.includes( 'is-expanded' ) === false ) {
						return element.click();
					}
				} );
		} );
	}

	isBackupUnderway() {
		const bannerIconSelector = By.css( '.banner.is-clickable .banner__icon-circle' );

		return driverHelper.isEventuallyPresentAndDisplayed( this.driver, bannerIconSelector );
	}
}
