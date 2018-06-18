/** @format */

import { By as by } from 'selenium-webdriver';

import * as driverHelper from '../../driver-helper.js';
import AsyncBaseContainer from '../../async-base-container';

export default class AccountSettingsPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.account.main' ) );
	}

	async chooseCloseYourAccount() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.account__settings-close' )
		);
	}
}
