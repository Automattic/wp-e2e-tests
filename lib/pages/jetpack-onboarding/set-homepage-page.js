import { By as by, until } from 'selenium-webdriver';
import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';

export default class SetHomepagePage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.jetpack-onboarding' ) );
	}

	selectPosts( ) {
		return driverHelper.clickWhenClickable( this.driver, by.css( 'a.card[data-e2e-type="posts"] button' ) );
	}

	selectPage( ) {
		return driverHelper.clickWhenClickable( this.driver, by.css( 'a.card[data-e2e-type="page"] button' ) );
	}
}
