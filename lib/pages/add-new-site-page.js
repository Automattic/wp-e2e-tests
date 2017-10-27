/** @format */
import { By } from 'selenium-webdriver';
import BaseContainer from '../base-container';

import * as driverHelper from '../driver-helper';

export default class AddNewSitePage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.jetpack-new-site__header-title' ) );
	}

	addSiteUrl( url ) {
		const urlInputSelector = By.css( '.form-text-input' );
		driverHelper.setWhenSettable( this.driver, urlInputSelector, url );

		const confirmButtonSelector = By.css( '.jetpack-connect__connect-button' );
		return driverHelper.clickWhenClickable(
			this.driver,
			confirmButtonSelector,
			this.explicitWaitMS
		);
	}
}
