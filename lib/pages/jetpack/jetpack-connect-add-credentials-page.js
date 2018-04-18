/** @format */
import { By } from 'selenium-webdriver';
import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';

export default class JetpackConnectAddCredentialsPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.is-section-jetpack-connect .jetpack-connect__site-url-input-container' ) );
	}

	enterDetailsAndConnect( username, password ) {
		driverHelper.setWhenSettable( this.driver, By.css( '#username' ), username );
		driverHelper.setWhenSettable( this.driver, By.css( '#password' ), password, { secureValue: true } );
		return driverHelper.clickWhenClickable( this.driver, By.css( '.jetpack-connect__credentials-submit' ) );
	}
}
