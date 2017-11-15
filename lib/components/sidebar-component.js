import { By, until } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper.js';
import * as driverManager from '../driver-manager.js';

import BaseContainer from '../base-container.js';

export default class SidebarComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.sidebar' ) );
		this.storeSelector = By.css( '.sites-navigation li a[href*=store]' );
		this.settingsSelector = By.css( '.sites-navigation .settings a' );
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
		const siteSwitcherSelector = By.css( '.current-site__switch-sites' );
		this.ensureSidebarMenuVisible();
		return driverHelper.isElementPresent( this.driver, siteSwitcherSelector ).then( present => {
			if ( present ) {
				return driverHelper.clickWhenClickable( this.driver, siteSwitcherSelector );
			}
			return false;
		} );
	}
	// Need to click header on mobile to focus the sidebar menu
	ensureSidebarMenuVisible() {
		if ( driverManager.currentScreenSize() !== 'mobile' ) {
			return;
		}
		driverHelper.isElementPresent( this.driver, By.css( '.focus-content' ) ).then( focusContent => {
			if ( focusContent ) {
				driverHelper.clickWhenClickable( this.driver, By.css( '.current-section a' ) );
			}
		} );
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
		return this.driver.findElement( this.settingsSelector ).click();
	}

	settingsOptionExists() {
		return driverHelper.isElementPresent( this.driver, this.settingsSelector );
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
	numberOfMenuItems() {
		return this.driver.findElements( By.css( '.sidebar .sidebar__menu li' ) ).then( ( elements ) => {
			return elements.length;
		} );
	}

	addNewSite() {
		this.ensureSidebarMenuVisible();
		const newSiteSelector = By.css( '.my-sites-sidebar__add-new-site' );
		return driverHelper.clickWhenClickable( this.driver, newSiteSelector );
	}

	addNewSiteWhenMultiple() {
		this.ensureSidebarMenuVisible();
		const newSiteSelector = By.css( '.site-selector__add-new-site .button' );
		return driverHelper.clickWhenClickable( this.driver, newSiteSelector );
	}

	/**
	 * Selects a jetpack site, if present, from the site switcher.
	 *
	 * @return Thenable<bool> true if a jetpack site was selected.
	 */
	selectJetpackSite() {
		const siteSwitcherSelector = By.css( '.current-site__switch-sites' );
		const siteSelector = By.css( '.is-jetpack' );

		this.ensureSidebarMenuVisible();
		return driverHelper.isElementPresent( this.driver, siteSwitcherSelector ).then( foundSwitcher => {
			if ( ! foundSwitcher ) {
				// no site switcher, only one site
				return false;
			}
			this.selectSiteSwitcher();
			return driverHelper.isElementPresent( this.driver, siteSelector ).then( foundSite => {
				if ( ! foundSite ) {
					// no jp sites left
					driverHelper.clickWhenClickable( this.driver, By.css( '.site' ) );
					return false;
				}
				driverHelper.clickWhenClickable( this.driver, siteSelector );
				return true;
			} );
		} );
	}
}
