import { By, until } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper.js';

import BaseContainer from '../base-container.js';

export default class SidebarComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.sidebar' ) );
		this.storeSelector = By.css( '.sites-navigation li a[href*=store]' );
	}
	selectDomains() {
		let selector = By.css( '.sites-navigation .domains a' );
		return driverHelper.clickWhenClickable( this.driver, selector );
	}
	selectPeople() {
		let selector = By.css( '.sites-navigation .users a' );
		return driverHelper.clickWhenClickable( this.driver, selector );
	}
	selectAddPerson() {
		let selector = By.css( '.sites-navigation .users a.sidebar__button' );
		return driverHelper.clickWhenClickable( this.driver, selector );
	}
	selectManagePlugins() {
		let selector = By.css( '.sites-navigation .plugins a.sidebar__button' );
		return driverHelper.clickWhenClickable( this.driver, selector );
	}
	selectThemes() {
		let selector = By.css( '.sites-navigation .themes a' );
		return driverHelper.clickWhenClickable( this.driver, selector );
	}
	selectPlan() {
		let selector = By.css( '.sites-navigation .upgrades-nudge a' );
		return driverHelper.clickWhenClickable( this.driver, selector );
	}
	selectAddNewPage() {
		let selector = By.css( '.sites-navigation [data-post-type="page"] a.sidebar__button' );
		return driverHelper.clickWhenClickable( this.driver, selector );
	}
	selectSiteSwitcher() {
		return driverHelper.clickWhenClickable( this.driver, By.css( '.current-site__switch-sites' ) );
	}
	searchForSite( searchString ) {
		const searchSelector = By.css( '.site-selector input[type="search"]' );
		const siteSelector = By.css( `.site-selector .site a[aria-label*="${searchString}"]` );

		this.driver.findElement( searchSelector ).then( ( searchField ) => {
			return searchField.isDisplayed().then( ( searchEnabled ) => {
				if ( searchEnabled ) {
					driverHelper.setWhenSettable( this.driver, searchSelector, searchString );
				}

				return driverHelper.clickWhenClickable( this.driver, siteSelector );
			} );
		} );
	}
	selectAllSites() {
		return driverHelper.clickWhenClickable( this.driver, By.css( '.all-sites a' ) );
	}
	selectViewThisSite() {
		return driverHelper.clickWhenClickable( this.driver, By.css( '.preview a' ) );
	}
	selectPlugins() {
		let selector = By.css( '.sites-navigation .plugins a' );
		let dismissNoticeSelector = By.css( '.notice.is-dismissable .notice__dismiss' );
		const driver = this.driver;

		return driverHelper.clickWhenClickable( driver, selector ).then(
			function success() {},
			function fail() {
				// Dismiss any visible notice (i.e upgrade nudge) and try again
				return driverHelper.clickIfPresent( driver, dismissNoticeSelector ).then( () => {
					return driverHelper.clickWhenClickable( driver, selector );
				} );
			} ).then( () => {
				return driver.wait( until.elementLocated( By.css( '.plugins-browser-list' ) ) )
			} );
	}
	selectSettings() {
		return this.driver.findElement( By.css( '.sites-navigation .settings a' ) ).click();
	}
	selectPosts() {
		const selector = By.css( '.sites-navigation [data-post-type="post"] a:not(.sidebar__button)' );
		return driverHelper.clickWhenClickable( this.driver, selector );
	}
	customizeTheme() {
		const selector = By.css( '.sites-navigation .themes a[href*=customize]' );
		return driverHelper.clickWhenClickable( this.driver, selector );
	}
	getCurrentSiteDomain() {
		const selector = By.css( '.current-site .site__domain' );
		driverHelper.waitTillPresentAndDisplayed( this.driver, selector );
		return this.driver.findElement( selector ).getText();
	}
	storeOptionDisplayed() {
		return driverHelper.isEventuallyPresentAndDisplayed( this.driver, this.storeSelector );
	}
	selectStoreOption() {
		return driverHelper.clickWhenClickable( this.driver, this.storeSelector );
	}
}
