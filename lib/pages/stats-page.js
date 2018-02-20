import { By } from 'selenium-webdriver';
import BaseContainer from '../base-container';

import * as driverHelper from '../driver-helper';

export default class StatsPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.stats-module' ) );
	}

	openIsights() {
		const insightsSelector = By.css( 'a[href*=insights]' );
		return driverHelper.clickWhenClickable( this.driver, insightsSelector );
	}

	openActivity() {
		const activitySelector = By.css( 'a[href*=activity]' );
		return driverHelper.clickWhenClickable( this.driver, activitySelector );
	}
}
