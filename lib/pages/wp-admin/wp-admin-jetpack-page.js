/** @format */

import { By } from 'selenium-webdriver';

import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';
import config from 'config';

const explicitWaitMS = config.get( 'explicitWaitMS' );

export default class WPAdminJetpackPage extends AsyncBaseContainer {
	constructor( driver ) {
		const ADMIN_PAGE_WAIT_MS = 25000;
		super( driver, By.css( '#jp-plugin-container' ), null, ADMIN_PAGE_WAIT_MS );
	}

	async connectWordPressCom() {
		const selector = By.css( 'a.jp-jetpack-connect__button' );
		const pauseBetweenFocusAttempts = 200;
		const connectJetpackButtonFocus =
			"document.getElementsByClassName( 'jp-jetpack-connect__button')[0].focus();";
		await driverHelper.waitTillPresentAndDisplayed( this.driver, selector );
		for ( let i = 0; i < explicitWaitMS / pauseBetweenFocusAttempts; i++ ) {
			await this.driver.executeScript( connectJetpackButtonFocus );
			let currentActiveElementId = await this.driver
				.switchTo()
				.activeElement()
				.getId();
			let connectJetpackButtonId = await ( await this.driver.findElement( selector ) ).getId();

			if ( connectJetpackButtonId === currentActiveElementId ) {
				break;
			}
			await this.driver.sleep( pauseBetweenFocusAttempts );
		}
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	async atAGlanceDisplayed() {
		return await driverHelper.isElementPresent( this.driver, By.css( '.jp-at-a-glance' ) );
	}

	async jumpstartDisplayed() {
		return await driverHelper.isElementPresent( this.driver, By.css( '.jp-jumpstart' ) );
	}

	async openPlansTab() {
		const selector = By.css( '.dops-section-nav__panel li.dops-section-nav-tab:nth-child(2) a' );
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	async clickUpgradeNudge() {
		const selector = By.css( '.dops-notice a[href*="upgrade"]' );
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	async activateRecommendedFeatures() {
		const selector = By.css( '.jp-jumpstart button.is-primary' );
		await driverHelper.clickWhenClickable( this.driver, selector );
		return await driverHelper.isElementPresent( this.driver, By.css( '.notice.is-success' ) );
	}

	async disconnectSite() {
		const manageConnectionButton = By.css( '.jp-connection-settings__actions a' );
		const disconnectButton = By.css(
			'.jp-connection-settings__modal-actions .dops-button.is-scary'
		);
		const successDisconnectNotice = By.css( ".dops-notice a[href*='disconnected']" );
		await driverHelper.clickWhenClickable( this.driver, manageConnectionButton );
		await driverHelper.clickWhenClickable( this.driver, disconnectButton );

		return await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			successDisconnectNotice,
			this.explicitWaitMS * 2
		);
	}
}
