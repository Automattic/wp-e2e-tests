/** @format */
import { By as by } from 'selenium-webdriver';
import BaseContainer from '../base-container';

import * as driverHelper from '../driver-helper';

export default class AddNewSitePage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.jetpack-new-site__header-title' ) );
	}

	addSiteUrl( url ) {
		const urlInputSelector = by.css( '.form-text-input' );
		driverHelper.setWhenSettable( this.driver, urlInputSelector, url );

		const confirmButtonSelector = by.css( '.jetpack-connect__connect-button' );
		return driverHelper.clickWhenClickable(
			this.driver,
			confirmButtonSelector,
			this.explicitWaitMS
		);
	}
}
