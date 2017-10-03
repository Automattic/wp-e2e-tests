import { By } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper.js';

import BaseContainer from '../base-container.js';

export default class ReaderSidebarComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.is-reader-page .sidebar' ) );
	}
	selectManageFollowing() {
		let selector = By.css( '.sidebar-streams__following a.sidebar__button' );
		return driverHelper.clickWhenClickable( this.driver, selector );
	}
	selectSearch() {
		let selector = By.css( '.sidebar-streams__search a' );
		return driverHelper.clickWhenClickable( this.driver, selector );
	}
}
