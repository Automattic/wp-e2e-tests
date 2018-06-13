/** @format */

import { By as by } from 'selenium-webdriver';

import BaseContainer from '../../base-container.js';
import * as driverHelper from '../../driver-helper.js';

export default class AccountSettingsPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.account.main' ) );
	}

	async chooseCloseYourAccount() {
		return driverHelper.clickWhenClickable( this.driver, by.css( '.account__settings-close' ) );
	}
}
