import { By as by } from 'selenium-webdriver';

import * as driverHelper from '../../driver-helper.js';
import BaseContainer from '../../base-container.js';

export default class GooglePasswordPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '#passwordNext' ) );
	}

	processPassword( password ) {
		console.log( 'Processing password' )
		driverHelper.setWhenSettable( this.driver, by.css( 'input[name="password"]' ), password, { secureValue: true } );
		return driverHelper.clickWhenClickable( this.driver, by.css( '#passwordNext' ) );
	}
};
