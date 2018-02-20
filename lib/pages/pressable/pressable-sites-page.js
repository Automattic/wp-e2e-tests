import { By } from 'selenium-webdriver';
import config from 'config';

import BaseContainer from '../../base-container';
import * as driverHelper from '../../driver-helper';

const explicitWaitMS = config.get( 'explicitWaitMS' );

export default class PressableSitesPage extends BaseContainer {
	constructor( driver, visit = false ) {
		const url = 'https://my.pressable.com/sites';

		super( driver, By.css( 'form[action="/sites"]' ), visit, url );
	}

	addNewSite( siteName ) {
		const siteNameInput = By.css( '#new_site_name' );
		const addNewSiteButton = By.css( '.new-site-index-button' );
		const wpAdminSiteButton = By.css( `div.wp-admin-btn a[href="http://${ siteName }.mystagingwebsite.com/wp-admin"]` );

		return driverHelper.setWhenSettable( this.driver, siteNameInput, siteName )
		.then( () => driverHelper.clickWhenClickable( this.driver, addNewSiteButton ) )
		.then( () => driverHelper.waitTillPresentAndDisplayed( this.driver, wpAdminSiteButton, explicitWaitMS * 7 ) );
	}

	gotoSettings( siteName ) {
		const siteSettingsButton = By.xpath( `//div[@class='site-bottom-wrapper'][descendant::a[contains(.,'${ siteName }')]]//div[contains(@class, 'manage-settings')]` );

		return driverHelper.clickWhenClickable( this.driver, siteSettingsButton );
	}

	gotoWPAdmin( siteName ) {
		const siteSettingsButton = By.xpath( `//div[@class='site-bottom-wrapper'][descendant::a[contains(.,'${ siteName }')]]//div[contains(@class, 'manage-settings')]` );

		return driverHelper.clickWhenClickable( this.driver, siteSettingsButton );
	}
}
