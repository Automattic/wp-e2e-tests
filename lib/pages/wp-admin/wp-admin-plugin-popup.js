/** @format */

import { By as by } from 'selenium-webdriver';
import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';

export default class WPAdminPluginPopup extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '#plugin-information' ) );
	}

	installPlugin() {
		const self = this;
		const installButtonSelector = by.css( '#plugin_install_from_iframe' );
		return driverHelper.isElementPresent( this.driver, installButtonSelector ).then( located => {
			if ( located === true ) {
				return driverHelper.clickWhenClickable(
					self.driver,
					installButtonSelector,
					this.explicitWaitMS * 2
				);
			}
		} );
	}
}
