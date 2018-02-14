import { By as by } from 'selenium-webdriver';
import BaseContainer from '../base-container';

import * as driverHelper from '../driver-helper';

export default class JetpackConnectInstallPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.is-section-jetpack-connect' ) );
		driver.getCurrentUrl().then( ( urlDisplayed ) => {
			this.setABTestControlGroupsInLocalStorage( urlDisplayed );
		} );
	}

	clickInstallButton() {
		return driverHelper.clickWhenClickable( this.driver, by.css( '.jetpack-connect__install .button.is-primary' ) );
	}
}
