/** @format */

import { By as by } from 'selenium-webdriver';

import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class WPAdminJetpackPage extends AsyncBaseContainer {
	constructor( driver ) {
		const ADMIN_PAGE_WAIT_MS = 25000;
		super( driver, by.css( '#jp-plugin-container' ), null, ADMIN_PAGE_WAIT_MS );
	}

	async connectWordPressCom() {
		const selector = by.css( 'a.jp-jetpack-connect__button' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, selector );
		await this.driver.sleep( 1000 );
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	async atAGlanceDisplayed() {
		return await driverHelper.isElementPresent( this.driver, by.css( '.jp-at-a-glance' ) );
	}

	async jumpstartDisplayed() {
		return await driverHelper.isElementPresent( this.driver, by.css( '.jp-jumpstart' ) );
	}

	async openPlansTab() {
		const selector = by.css( '.dops-section-nav__panel li.dops-section-nav-tab:nth-child(2) a' );
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	async clickUpgradeNudge() {
		const selector = by.css( '.dops-notice a[href*="upgrade"]' );
		return await driverHelper.clickWhenClickable( this.driver, selector, 10000 );
	}

	async activateRecommendedFeatures() {
		const selector = by.css( '.jp-jumpstart button.is-primary' );
		await driverHelper.clickWhenClickable( this.driver, selector );
		return await driverHelper.isElementPresent( this.driver, by.css( '.notice.is-success' ) );
	}
}
