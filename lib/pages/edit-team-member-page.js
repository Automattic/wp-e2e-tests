/** @format */

import { By, until } from 'selenium-webdriver';
import BaseContainer from '../base-container.js';

import * as driverHelper from '../driver-helper.js';

export default class EditTeamMemberPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.edit-team-member-form' ) );
	}

	removeUserAndDeleteContent() {
		driverHelper.clickWhenClickable( this.driver, By.css( 'input[value="delete"]' ) );
		return driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.delete-user__single-site button' )
		);
	}

	removeSelectedUser() {
		driverHelper.clickWhenClickable( this.driver, By.css( '.delete-user__remove-user' ) );
		return driverHelper.clickWhenClickable( this.driver, By.css( '.dialog button.is-primary' ) );
	}

	changeToNewRole( roleName ) {
		driverHelper.clickWhenClickable(
			this.driver,
			By.css( `select#roles option[value=${ roleName }]` )
		);
		driverHelper.clickWhenClickable( this.driver, By.css( 'button.form-button.is-primary' ) );
		return this.driver.wait(
			until.elementLocated( By.css( '.is-success' ) ),
			this.explicitWaitMS,
			'Could not locate the success message'
		);
	}

	successNoticeDisplayed() {
		return driverHelper.isElementPresent( this.driver, By.css( '.is-success' ) );
	}
}
