import { By as by, until } from 'selenium-webdriver';
import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';

export default class SiteTypePage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.jetpack-onboarding' ) );
	}

	selectPersonalSite( ) {
		return driverHelper.clickWhenClickable( this.driver, by.css( 'a.card[data-e2e-type="personal"] button' ) );
	}

	selectBusinessSite( ) {
		return driverHelper.clickWhenClickable( this.driver, by.css( 'a.card[data-e2e-type="business"] button' ) );
	}
}
