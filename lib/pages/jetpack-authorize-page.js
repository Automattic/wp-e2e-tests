import { By as by } from 'selenium-webdriver';
import BaseContainer from '../base-container';

import * as driverHelper from '../driver-helper';

export default class JetpackAuthorizePage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.is-section-jetpackConnect' ) );
		// driver.getCurrentUrl().then( ( urlDisplayed ) => {
		// 	this.setABTestControlGroupsInLocalStorage( urlDisplayed );
		// } );
	}

	chooseSignIn() {
		return driverHelper.clickWhenClickable( this.driver, by.css( '.logged-out-form__link-item' ) );
	}

	approveConnection() {
		return driverHelper.clickWhenClickable( this.driver, by.css( '.jetpack-connect__authorize-form button' ) );
	}
}
