import { By } from 'selenium-webdriver';
import BaseContainer from '../base-container.js';
import DisconnectSurveyPage from './disconnect-survey-page.js';

import * as DriverHelper from '../driver-helper.js';

export default class SettingsPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.site-settings' ) );
	}

	selectWriting() {
		DriverHelper.ensureMobileMenuOpen( this.driver );
		return DriverHelper.clickWhenClickable( this.driver, By.css( '.section-nav-tabs__list a[href*=writing]' ) );
	}

	mediaSettingsSectionDisplayed() {
		return DriverHelper.isEventuallyPresentAndDisplayed( this.driver, By.css( '.site-settings__media-settings' ) );
	}

	photonToggleDisplayed() {
		return DriverHelper.isEventuallyPresentAndDisplayed( this.driver, By.css( '[id*=photon-toggle]' ) );
	}

	carouselToggleDisplayed() {
		return DriverHelper.isEventuallyPresentAndDisplayed( this.driver, By.css( '[id*=carousel-toggle]' ) );
	}

	carouseBackgroundColorDisplayed() {
		return DriverHelper.isEventuallyPresentAndDisplayed( this.driver, By.css( '#carousel_background_color' ) );
	}

	manageConnection() {
		return DriverHelper.clickWhenClickable( this.driver, By.css( 'a[href*="manage-connection"]' ) );
	}

	disconnectSite() {
		DriverHelper.clickWhenClickable( this.driver, By.css( '.manage-connection__disconnect-link a' ) );

		DriverHelper.isElementPresent( this.driver, By.css( '.is-primary.is-scary' ) )
		.then( ( present ) => {
			// TODO: Remove that once Disconnect Survey would released
			if ( present ) {
				DriverHelper.clickWhenClickable( this.driver, By.css( '.is-primary.is-scary' ) );
				return DriverHelper.isElementPresent( this.driver, By.css( '.notice.is-success' ) );
			}

			const surveyPage = new DisconnectSurveyPage( this.driver );
			return surveyPage.skipSurveyAndDisconnectSite();
		} );
	}
}
