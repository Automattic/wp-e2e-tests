import webdriver from 'selenium-webdriver';
import { By, until } from 'selenium-webdriver';
import BaseContainer from '../base-container.js';

import * as DriverHelper from '../driver-helper.js';

const by = webdriver.By;

export default class SettingsPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.site-settings' ) );
	}

	selectWriting() {
		DriverHelper.ensureMobileMenuOpen( this.driver );
		return DriverHelper.clickWhenClickable( this.driver, By.css( '.section-nav-tabs__list a[href*=writing]' ) );
	}

	mediaSettingsSectionDisplayed() {
		return DriverHelper.isEventuallyPresentAndDisplayed( this.driver, By.css( '.media-settings__info-link-container' ) );
	}

	photonToggleDisplayed() {
		return DriverHelper.isEventuallyPresentAndDisplayed( this.driver, By.css( 'span[id*=photon-toggle]' ) );
	}
}
