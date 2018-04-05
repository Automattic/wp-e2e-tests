/** @format */

import { By } from 'selenium-webdriver';

import BaseContainer from '../../base-container';
import PressableSiteSettingsPage from './pressable-site-settings-page';
import * as driverHelper from '../../driver-helper';

export default class PressableSitesPage extends BaseContainer {
	constructor( driver, visit = false ) {
		const url = 'https://my.pressable.com/sites';
		const expectedSelector = By.css( '.site-show-sections.admin-area' );

		super( driver, expectedSelector, visit, url );
	}

	addNewSite( siteName ) {
		const formSelector = By.css( 'form[action="/sites"]' );
		const siteNameInput = By.css( '#new_site_name' );
		const addNewSiteButton = By.css( '.new-site-index-button' );
		const wpAdminSiteButton = By.css(
			`div.wp-admin-btn a[href="http://${ siteName }.mystagingwebsite.com/wp-admin"]`
		);

		driverHelper.isElementPresent( this.driver, formSelector ).then( element => {
			if ( ! element ) {
				return this.deleteFirstSite();
			}
			return;
		} );
		driverHelper.setWhenSettable( this.driver, siteNameInput, siteName );
		driverHelper.clickWhenClickable( this.driver, addNewSiteButton );
		driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			wpAdminSiteButton,
			this.explicitWaitMS * 12
		);
		// wait until new site is properly setted up
		return this.driver.sleep( 3000 );
	}

	gotoSettings( siteName ) {
		const siteSettingsButton = By.xpath(
			`//div[@class='site-bottom-wrapper'][descendant::a[contains(.,'${ siteName }')]]//div[contains(@class, 'manage-settings')]`
		);

		return driverHelper.clickWhenClickable(
			this.driver,
			siteSettingsButton,
			this.explicitWaitMS * 2
		);
	}

	gotoWPAdmin( siteName ) {
		const siteSettingsButton = By.xpath(
			`//div[@class='site-bottom-wrapper'][descendant::a[contains(.,'${ siteName }')]]//div[contains(@class, 'manage-settings')]`
		);

		return driverHelper.clickWhenClickable( this.driver, siteSettingsButton );
	}

	deleteFirstSite() {
		this.gotoSettings( 'e2eflowtesting' );
		return new PressableSiteSettingsPage( this.driver ).deleteSite();
	}
}
