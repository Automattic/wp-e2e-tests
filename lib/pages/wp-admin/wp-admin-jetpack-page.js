import { By as by } from 'selenium-webdriver';
import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';

export default class WPAdminJetpackPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '#jp-plugin-container' ) );
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

	openPlansTab() {
		const selector = by.css( '.dops-section-nav__panel li.dops-section-nav-tab:nth-child(2) a' );
		return driverHelper.clickWhenClickable( this.driver, selector );
	}

	clickUpgradeNudge() {
		const selector = by.css( 'a.dops-notice__action[href*="upgrade"]' );
		return driverHelper.clickWhenClickable( this.driver, selector, 10000 );
	}
}
