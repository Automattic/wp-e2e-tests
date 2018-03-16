import { By as by } from 'selenium-webdriver';
import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';

export default class ActivateStatsPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.jetpack-onboarding' ) );
	}

	selectActivateStats( ) {
		return driverHelper.clickWhenClickable( this.driver, by.css( 'a.card[data-e2e-type="activate-stats"] button' ) );
	}

	selectContinue( ) {
		const continueSelector = by.css( 'a.card[data-e2e-type="continue"] button' );
		return driverHelper.waitTillPresentAndDisplayed( this.driver, continueSelector )
			.then( () => driverHelper.clickWhenClickable( this.driver, continueSelector ) );
	}
}
