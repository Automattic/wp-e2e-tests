import { By as by } from 'selenium-webdriver';
import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';

export default class WPAdminJetpackPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '#jp-plugin-container' ) );
	}

	connectWordPressCom() {
		return driverHelper.clickWhenClickable( this.driver, by.css( '.jp-jetpack-connect__button' ) );
	}

	atAGlanceDisplayed() {
		return this.driver.isElementPresent( by.css( '.jp-at-a-glance' ) );
	}
}
