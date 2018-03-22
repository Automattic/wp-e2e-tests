/** @format */

import { By } from 'selenium-webdriver';
import BaseContainer from '../base-container.js';
import DisconnectSurveyPage from './disconnect-survey-page.js';

import * as driverHelper from '../driver-helper.js';

export default class SettingsPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.site-settings' ) );
	}

	selectWriting() {
		driverHelper.ensureMobileMenuOpen( this.driver );
		return driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.section-nav-tabs__list a[href*=writing]' )
		);
	}

	mediaSettingsSectionDisplayed() {
		return driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			By.css( '.site-settings__media-settings' )
		);
	}

	photonToggleDisplayed() {
		return driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			By.css( '[id*=photon-toggle]' )
		);
	}

	carouselToggleDisplayed() {
		return driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			By.css( '[id*=carousel-toggle]' )
		);
	}

	carouseBackgroundColorDisplayed() {
		return driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			By.css( '#carousel_background_color' )
		);
	}

	manageConnection() {
		return driverHelper.clickWhenClickable( this.driver, By.css( 'a[href*="manage-connection"]' ) );
	}

	disconnectSite() {
		driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.manage-connection__disconnect-link a' )
		);

		return new DisconnectSurveyPage( this.driver ).skipSurveyAndDisconnectSite();
	}
}
