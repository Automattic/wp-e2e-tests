/** @format */

import { By } from 'selenium-webdriver';

import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';

export default class SiteTitleTaglinePage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.jetpack-onboarding .site-title' ) );
	}

	enterTitle( siteTitle ) {
		return driverHelper.setWhenSettable( this.driver, By.css( 'input#blogname' ), siteTitle );
	}

	enterTagline( siteTagline ) {
		return driverHelper.setWhenSettable(
			this.driver,
			By.css( 'input#blogdescription' ),
			siteTagline
		);
	}

	selectContinue() {
		return driverHelper.clickWhenClickable( this.driver, By.css( 'button.is-primary' ) );
	}
}
