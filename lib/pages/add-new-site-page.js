/** @format */
import { By } from 'selenium-webdriver';
import BaseContainer from '../base-container';

import * as driverHelper from '../driver-helper';
import * as driverManager from '../driver-manager';

export default class AddNewSitePage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.jetpack-new-site__header-title' ) );
	}

	addSiteUrl( url ) {
		let urlInputSelector = By.css( '.jetpack-new-site__jetpack-site #siteUrl' );
		let confirmButtonSelector = By.css(
			'.jetpack-new-site__jetpack-site .jetpack-connect__connect-button'
		);

		if ( driverManager.currentScreenSize() === 'mobile' ) {
			urlInputSelector = By.css( '.jetpack-new-site__mobile-jetpack-site #siteUrl' );
			confirmButtonSelector = By.css(
				'.jetpack-new-site__mobile-jetpack-site .jetpack-connect__connect-button'
			);
		}

		driverHelper.setWhenSettable( this.driver, urlInputSelector, url );

		return driverHelper.clickWhenClickable(
			this.driver,
			confirmButtonSelector,
			this.explicitWaitMS
		);
	}
}
