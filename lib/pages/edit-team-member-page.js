import { By, until } from 'selenium-webdriver';
import BaseContainer from '../base-container.js';

import * as DriverHelper from '../driver-helper.js';

export default class EditTeamMemberPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.edit-team-member-form' ) );
	}

	removeUserAndDeleteContent() {
		DriverHelper.clickWhenClickable( this.driver, By.css( 'input[value="delete"]' ) );
		return DriverHelper.clickWhenClickable( this.driver, By.css( '.delete-user__single-site button' ) );
	}

	removeSelectedUser() {
		DriverHelper.clickWhenClickable( this.driver, By.css( '.delete-user__remove-user' ) );
		return DriverHelper.clickWhenClickable( this.driver, By.css( '.dialog button.is-primary' ) );
	}

	changeToNewRole( roleName ) {
		const roleSelector = By.css( `select#roles option[value=${roleName}]` );
		const buttonSelector = By.css( '.edit-team-member-form__form button:not([disabled])' );

		return DriverHelper.clickWhenClickable( this.driver, roleSelector )
		.then( () => DriverHelper.clickWhenClickable( this.driver, buttonSelector ) )
		.then( () => this.driver.wait(
			until.elementLocated( By.css( '.people-notices__notice.is-success' ) ),
			this.explicitWaitMS,
			'Could not locate the success message' ) );
	}

	successNoticeDisplayed() {
		return DriverHelper.isElementPresent( this.driver, By.css( '.is-success' ) );
	}
}
