/** @format */

import { By, until } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper.js';

import BaseContainer from '../base-container.js';
import DisconnectSurveyPage from '../pages/disconnect-survey-page.js';

export default class SidebarComponent extends BaseContainer {
	constructor( driver, siteName = null ) {
		super( driver, By.css( '.sidebar' ) );
		this.storeSelector = By.css( '.sites-navigation li a[href*=store]' );
		this.settingsSelector = By.css( '.sites-navigation [data-tip-target="settings"] a' );
		if ( siteName !== null ) {
			this.selectSite( siteName );
		}
	}

	async selectDomains() {
		let selector = By.css( '.sites-navigation [data-tip-target="domains"] a' );
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	async selectPeople() {
		let selector = By.css( '.sites-navigation [data-tip-target="people"] a' );
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	async selectAddPerson() {
		let selector = By.css( '.sites-navigation [data-tip-target="users"] a.sidebar__button' );
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	async selectManagePlugins() {
		let selector = By.css( '.sites-navigation [data-tip-target="plugins"] a.sidebar__button' );
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	async selectThemes() {
		let selector = By.css( '.sites-navigation [data-tip-target="themes"] a[href*=themes]' );
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	customizeTheme() {
		const selector = By.css( '.sites-navigation [data-tip-target="themes"] a[href*=customize]' );
		return driverHelper.clickWhenClickable( this.driver, selector );
	}

	async selectPlan() {
		let selector = By.css( '.sites-navigation [data-tip-target="plan"] a' );
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	async selectAddNewPage() {
		let selector = By.css( '.sites-navigation [data-post-type="page"] a.sidebar__button' );
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	async selectSiteSwitcher() {
		const siteSwitcherSelector = By.css( '.current-site__switch-sites' );
		await this.ensureSidebarMenuVisible();
		let present = await driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			siteSwitcherSelector,
			1000
		);
		if ( present ) {
			return await driverHelper.clickWhenClickable( this.driver, siteSwitcherSelector );
		}
		return false;
	}

	async selectStats() {
		let selector = By.css( '.sites-navigation .stats a' );
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	async ensureSidebarMenuVisible() {
		let allSitesSelector = By.css( '.current-section a' );
		let sidebarSelector = By.css( '.sidebar' );
		let sidebarVisible = await this.driver.findElement( sidebarSelector ).isDisplayed();

		if ( ! sidebarVisible ) {
			await driverHelper.clickWhenClickable( this.driver, allSitesSelector );
		}
		return await driverHelper.waitTillPresentAndDisplayed( this.driver, sidebarSelector );
	}

	async searchForSite( searchString ) {
		const searchSelector = By.css( '.site-selector input[type="search"]' );
		const siteSelector = By.css( `.site-selector .site a[aria-label*="${ searchString }"]` );

		let searchField = await this.driver.findElement( searchSelector );
		let searchEnabled = await searchField.isDisplayed();
		if ( searchEnabled ) {
			await driverHelper.setWhenSettable( this.driver, searchSelector, searchString );
			return await driverHelper.clickWhenClickable( this.driver, siteSelector );
		}
		return await driverHelper.clickWhenClickable( this.driver, siteSelector );
	}

	async selectAllSites() {
		return await driverHelper.clickWhenClickable( this.driver, By.css( '.all-sites a' ) );
	}

	async selectViewThisSite() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '[data-tip-target="sitePreview"] a' )
		);
	}

	async selectPlugins() {
		let selector = By.css( '.sites-navigation [data-tip-target="plugins"] a' );
		let dismissNoticeSelector = By.css( '.notice.is-dismissable .notice__dismiss' );
		const driver = this.driver;

		return await driverHelper
			.clickWhenClickable( driver, selector )
			.then(
				() => {}, // success
				async () => {
					// fail
					// Dismiss any visible notice (i.e upgrade nudge) and try again
					await driverHelper.clickIfPresent( driver, dismissNoticeSelector );
					return await driverHelper.clickWhenClickable( driver, selector );
				}
			)
			.then( async () => {
				return await driver.wait( until.elementLocated( By.css( '.plugins-browser-list' ) ) );
			} );
	}

	async selectSettings() {
		let dismissNoticeSelector = By.css( '.notice.is-dismissable .notice__dismiss' );
		const driver = this.driver;

		if ( await driverHelper.isElementPresent( driver, dismissNoticeSelector ) ) {
			await driverHelper.clickIfPresent( driver, dismissNoticeSelector );
		}
		return await driverHelper.clickWhenClickable( driver, this.settingsSelector );
	}

	async settingsOptionExists() {
		return await driverHelper.isElementPresent( this.driver, this.settingsSelector );
	}

	async selectPages() {
		const selector = By.css( '.sites-navigation [data-post-type="page"] a:not(.sidebar__button)' );
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	async selectPosts() {
		const selector = By.css( '.sites-navigation [data-post-type="post"] a:not(.sidebar__button)' );
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	async selectComments() {
		const selector = By.css( '.sites-navigation [data-post-type="comments"] a' );
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	getCurrentSiteDomain() {
		const selector = By.css( '.current-site .site__domain' );
		driverHelper.waitTillPresentAndDisplayed( this.driver, selector );
		return this.driver.findElement( selector ).getText();
	}

	async storeOptionDisplayed() {
		return await driverHelper.isEventuallyPresentAndDisplayed( this.driver, this.storeSelector );
	}

	async selectStoreOption() {
		return await driverHelper.clickWhenClickable( this.driver, this.storeSelector );
	}

	async numberOfMenuItems() {
		let elements = await this.driver.findElements( By.css( '.sidebar .sidebar__menu li' ) );
		return elements.length;
	}

	async addNewSite() {
		await this.ensureSidebarMenuVisible();

		const sidebarNewSiteButton = By.css( '.my-sites-sidebar__add-new-site' );
		const siteSwitcherNewSiteButton = By.css( '.site-selector__add-new-site .button svg' );
		let present = await driverHelper.isElementPresent( this.driver, sidebarNewSiteButton );
		if ( present ) {
			return await driverHelper.clickWhenClickable( this.driver, sidebarNewSiteButton );
		}
		await this.selectSiteSwitcher();

		return await driverHelper.clickWhenClickable( this.driver, siteSwitcherNewSiteButton );
	}

	/**
	 * Removes a single jetpack site with error label from the sites list.
	 *
	 * @return {Promise<boolean>} true if a site was removed
	 */
	async removeBrokenSite() {
		const siteSwitcherSelector = By.css( '.current-site__switch-sites' );
		const brokenSiteButton = By.css( '.is-error .site-indicator__button' );
		const disconnectJetpackButton = By.css( '.site-indicator__action a[href*="disconnect-site"]' );
		const clearSearchButton = By.css( '.search__close-icon' );

		await this.ensureSidebarMenuVisible();
		let foundSwitcher = await driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			siteSwitcherSelector
		);
		if ( ! foundSwitcher ) {
			// no site switcher, only one site
			return false;
		}
		await this.selectSiteSwitcher();
		let clearSearch = await driverHelper.isElementPresent( this.driver, clearSearchButton );
		if ( clearSearch ) {
			await driverHelper.clickWhenClickable( this.driver, clearSearchButton );
		}
		let foundBroken = await driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			brokenSiteButton
		);
		if ( ! foundBroken ) {
			// no broken sites
			return false;
		}
		await driverHelper.clickWhenClickable( this.driver, brokenSiteButton );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, disconnectJetpackButton );
		await driverHelper.clickWhenClickable( this.driver, disconnectJetpackButton );
		const surveyPage = new DisconnectSurveyPage( this.driver );
		await surveyPage.skipSurveyAndDisconnectSite();
		// Necessary to drive the loop forward
		return true;
	}

	async selectSite( siteName ) {
		const siteSelector = By.css( `.site__content[title='${ siteName }']` );
		const siteSwitcherSelector = By.css( '.current-site__switch-sites' );

		await this.ensureSidebarMenuVisible();
		let foundSwitcher = await driverHelper.isElementPresent( this.driver, siteSwitcherSelector );
		if ( ! foundSwitcher ) {
			// no site switcher, only one site
			return false;
		}
		await this.selectSiteSwitcher();
		let site = await driverHelper.isElementPresent( this.driver, siteSelector );
		if ( ! site ) {
			// site is not in present in list
			return false;
		}
		return await driverHelper.clickWhenClickable( this.driver, siteSelector );
	}
}
