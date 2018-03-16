import { By as by, until } from 'selenium-webdriver';
import config from 'config';
import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';
import * as dataHelper from '../../data-helper';

export default class SiteTitleTaglinePage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.jetpack-onboarding .site-title' ) );
	}

	enterTitle( siteTitle ) {
		return driverHelper.setWhenSettable( this.driver, by.css( 'input#blogname' ), siteTitle );
	}

	enterTagline( siteTagline ) {
		return driverHelper.setWhenSettable( this.driver, by.css( 'input#blogdescription' ), siteTagline );
	}

	selectContinue() {
		return driverHelper.clickWhenClickable( this.driver, by.css( 'button.is-primary' ) );
	}
}
