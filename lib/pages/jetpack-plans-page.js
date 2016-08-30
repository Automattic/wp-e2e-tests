import { By as by } from 'selenium-webdriver';
import BaseContainer from '../base-container';

import * as driverHelper from '../driver-helper';
import * as driverManager from '../driver-manager';
import * as slackNotifier from '../slack-notifier';

export default class JetpackPlansPage extends BaseContainer {
	constructor( driver ) {
		const selector = by.css( '.jetpack-connect__plans' );
		driverHelper.isEventuallyPresentAndDisplayed( driver, selector ).then( ( present ) => {
			if ( present === false ) {
				slackNotifier.warn( 'Could not see the Jetpack plans page - refreshing to see whether this fixes it' );
				driver.navigate().refresh();
			}
		} );
		super( driver, selector );
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
