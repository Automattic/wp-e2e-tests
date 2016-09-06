import { By as by } from 'selenium-webdriver';

import * as driverHelper from '../../driver-helper.js';

import BaseContainer from '../../base-container.js';

export default class TwitterAuthorizePage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.auth' ) );
	}

	signInAndAllow( username, password ) {
		driverHelper.setWhenSettable( this.driver, by.css( '#username_or_email' ), username );
		driverHelper.setWhenSettable( this.driver, by.css( '#password' ), password, { secureValue: true } );
		return driverHelper.clickWhenClickable( this.driver, by.css( '#allow' ) );
	}
};
