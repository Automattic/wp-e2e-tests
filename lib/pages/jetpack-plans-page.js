import { By as by } from 'selenium-webdriver';
import BaseContainer from '../base-container';

import * as driverHelper from '../driver-helper';
import * as driverManager from '../driver-manager';

export default class JetpackPlansPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.jetpack-connect__plans' ) );
	}

	chooseFreePlan() {
		let selector = null;
		if ( driverManager.currentScreenSize() === 'mobile' ) {
			selector = by.css( '.plan-features__mobile button.is-free-plan' );
		} else {
			selector = by.css( '.plan-features__table button.is-free-plan' );
		}
		this.driver.sleep( 1000 ); // not sure why this is needed to trigger the click below
		driverHelper.waitTillPresentAndDisplayed( this.driver, selector );
		return driverHelper.clickWhenClickable( this.driver, selector );
	}
}
