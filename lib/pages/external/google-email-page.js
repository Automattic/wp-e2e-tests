import { By as by } from 'selenium-webdriver';

import * as driverHelper from '../../driver-helper.js';
import BaseContainer from '../../base-container.js';

export default class GoogleEmailPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '#identifierNext' ) );
	}

	processEmail( email ) {
		console.log( 'Processing email' )
		driverHelper.setWhenSettable( this.driver, by.css( '#identifierId' ), email );
		return driverHelper.clickWhenClickable( this.driver, by.css( '#identifierNext' ) );
	}
};
