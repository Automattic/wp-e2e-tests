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
		return this.driver.isElementPresent( by.css( '.jp-at-a-glance' ) );
	}
}
