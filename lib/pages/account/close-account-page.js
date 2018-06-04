/** @format */

import { By as by } from 'selenium-webdriver';

import BaseContainer from '../../base-container.js';
import * as driverHelper from '../../driver-helper.js';

export default class CloseAccountPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.account-close' ) );
	}

	async chooseCloseAccount() {
		const accountCloseButtonSelector = by.css( '.account-close button.is-scary' );
		driverHelper.waitTillPresentAndDisplayed( this.driver, accountCloseButtonSelector );
		return driverHelper.clickWhenClickable( this.driver, accountCloseButtonSelector );
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
