import { By as by } from 'selenium-webdriver';
import BaseContainer from '../base-container';

import * as driverHelper from '../driver-helper';

export default class JetpackConnectInstallPage extends BaseContainer {
	constructor( driver, setABTests = true ) {
		super( driver, by.css( '.is-section-jetpack-connect .jetpack-connect__install' ) );

		if ( setABTests ) {
			driver.getCurrentUrl().then( ( urlDisplayed ) => {
				this.setABTestControlGroupsInLocalStorage( urlDisplayed );
			} );
		}
	}

	clickInstallButton() {
		const buttonSelector = by.css( '.jetpack-connect__install .button.is-primary' );
		return driverHelper.waitTillPresentAndDisplayed( this.driver, buttonSelector )
		.then( () => driverHelper.clickWhenClickable( this.driver, buttonSelector ) );
	}
}
