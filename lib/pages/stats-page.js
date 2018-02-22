import { By } from 'selenium-webdriver';
import BaseContainer from '../base-container';

import * as driverHelper from '../driver-helper';
import * as driverManager from '../driver-manager';

export default class StatsPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.stats-module' ) );
	}

	openIsights() {
		const insightsSelector = By.css( 'a[href*=insights]' );
		return this.expandNavIfMobile()
		.then( () => driverHelper.clickWhenClickable( this.driver, insightsSelector ) );
	}

	openActivity() {
		const activitySelector = By.css( 'a[href*=activity]' );
		return this.expandNavIfMobile()
		.then( () => driverHelper.clickWhenClickable( this.driver, activitySelector ) );
	}

	expandNavIfMobile() {
		if ( driverManager.currentScreenSize() !== 'mobile' ) {
			return this.waitForPage();
		}

		const mobileNav = By.css( '.section-nav__mobile-header' );
		return driverHelper.clickWhenClickable( this.driver, mobileNav );
	}
}
