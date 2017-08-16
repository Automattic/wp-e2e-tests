import { By as by } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper.js';

import BaseContainer from '../base-container.js';

export default class EditorConfirmationSidebarComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.editor-confirmation-sidebar.is-active' ) );
	}

	confirmAndPublish() {
		return driverHelper.clickWhenClickable( this.driver, by.css( '.editor-confirmation-sidebar__action button.button' ) );
	}
}
