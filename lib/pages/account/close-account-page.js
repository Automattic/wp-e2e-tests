/** @format */

import { By as by } from 'selenium-webdriver';

import * as driverHelper from '../../driver-helper.js';

import AsyncBaseContainer from '../../async-base-container';

export default class CloseAccountPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.account-close' ) );
	}

	async chooseCloseAccount() {
		await this.driver.sleep( 1000 ); // Button doesn't register clicks immediately
		return driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.account-close button.is-scary' )
		);
	}

	async enterAccountNameAndClose( accountName ) {
		driverHelper.setWhenSettable(
			this.driver,
			by.css( '.account-close__confirm-dialog-confirm-input' ),
			accountName
		);
		return driverHelper.clickWhenClickable( this.driver, by.css( '.dialog button.is-scary' ) );
	}
}
