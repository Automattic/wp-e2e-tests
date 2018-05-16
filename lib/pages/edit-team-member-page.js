/** @format */

import { By } from 'selenium-webdriver';
import BaseContainer from '../base-container.js';

import * as DriverHelper from '../driver-helper.js';

export default class EditTeamMemberPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.edit-team-member-form' ) );
	}

	async removeUserAndDeleteContent() {
		await DriverHelper.clickWhenClickable( this.driver, By.css( 'input[value="delete"]' ) );
		return await DriverHelper.clickWhenClickable(
			this.driver,
			By.css( '.delete-user__single-site button' )
		);
	}

	removeSelectedUser() {
		DriverHelper.clickWhenClickable( this.driver, By.css( '.delete-user__remove-user' ) );
		return DriverHelper.clickWhenClickable( this.driver, By.css( '.dialog button.is-primary' ) );
	}

	changeToNewRole( roleName ) {
		// Work out why we need to do this twice
		// https://github.com/Automattic/wp-e2e-tests/issues/1185
		DriverHelper.clickWhenClickable(
			this.driver,
			By.css( `select#roles option[value=${ roleName }]` )
		);
		DriverHelper.clickWhenClickable(
			this.driver,
			By.css( `select#roles option[value=${ roleName }]` )
		);
		DriverHelper.clickWhenClickable(
			this.driver,
			By.css( 'button.form-button.is-primary:not([disabled])' )
		);
		return DriverHelper.waitTillPresentAndDisplayed( this.driver, By.css( '.is-success' ) );
	}

	successNoticeDisplayed() {
		return DriverHelper.isElementPresent( this.driver, By.css( '.is-success' ) );
	}
}
