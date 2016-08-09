import { By as by } from 'selenium-webdriver';
import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';

export default class WPAdminJetpackPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '#jp-plugin-container' ) );
	}

	connectWordPressCom() {
		driverHelper.clickWhenClickable( this.driver, by.css( '.jp-jetpack-connect__button' ) );
	}
}
