/** @format */

import { By as by } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper.js';

import BaseContainer from '../base-container.js';

export default class EditorConfirmationSidebarComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.editor-confirmation-sidebar.is-active' ) );
	}

	confirmAndPublish() {
		return driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.editor-confirmation-sidebar__action button.button' )
		);
	}

	publishDateShown() {
		const dateSelector = by.css(
			'.editor-confirmation-sidebar .editor-publish-date__header-chrono'
		);
		driverHelper.waitTillPresentAndDisplayed( this.driver, dateSelector );
		return this.driver.findElement( dateSelector ).getText();
	}
}
