/** @format */

import { By as by } from 'selenium-webdriver';
import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';

export default class WPAdminJetpackPage extends BaseContainer {
	constructor( driver ) {
		const ADMIN_PAGE_WAIT_MS = 25000;
		super( driver, by.css( '#jp-plugin-container' ), false, null, ADMIN_PAGE_WAIT_MS );
	}

	connectWordPressCom() {
		const selector = by.css( 'a.jp-jetpack-connect__button' );
		driverHelper.waitTillPresentAndDisplayed( this.driver, selector );
		this.driver.sleep( 1000 ).then( () => {
			return driverHelper.clickWhenClickable( this.driver, selector );
		} );
	}

	atAGlanceDisplayed() {
		return driverHelper.isElementPresent( this.driver, by.css( '.jp-at-a-glance' ) );
	}

	jumpstartDisplayed() {
		return driverHelper.isElementPresent( this.driver, by.css( '.jp-jumpstart' ) );
	}

	openPlansTab() {
		const selector = by.css( '.dops-section-nav__panel li.dops-section-nav-tab:nth-child(2) a' );
		return driverHelper.clickWhenClickable( this.driver, selector );
	}

	clickUpgradeNudge() {
		const selector = by.css( '.dops-notice a[href*="upgrade"]' );
		return driverHelper.clickWhenClickable( this.driver, selector, 10000 );
	}

	activateRecommendedFeatures() {
		const selector = by.css( '.jp-jumpstart button.is-primary' );
		driverHelper.clickWhenClickable( this.driver, selector );
		return driverHelper.isElementPresent( this.driver, by.css( '.notice.is-success' ) );
	}
}
