/** @format */

import { By, until } from 'selenium-webdriver';

import AsyncBaseContainer from '../async-base-container';
import DisconnectSurveyPage from '../pages/disconnect-survey-page.js';
import * as driverHelper from '../driver-helper.js';

export default class SidebarComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.sidebar' ) );
		this.storeSelector = By.css( '.sites-navigation li a[href*=store]' );
		this.settingsSelector = By.css( '.sites-navigation [data-tip-target="settings"] a' );
	}

	async selectDomains() {
		const selector = By.css( '.sites-navigation [data-tip-target="domains"] a' );
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	async selectPeople() {
		const selector = By.css( '.sites-navigation [data-tip-target="people"] a' );
		await driverHelper.scrollIntoView( this.driver, selector );
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	async selectAddPerson() {
		const selector = By.css( '.sites-navigation [data-tip-target="people"] a.sidebar__button' );
		await driverHelper.scrollIntoView( this.driver, selector );
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	async selectManagePlugins() {
		const selector = By.css(
			'.sites-navigation [data-tip-target="side-menu-plugins"] a.sidebar__button'
		);
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	async selectThemes() {
		const selector = By.css( '.sites-navigation [data-tip-target="themes"] a[href*=themes]' );
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	async customizeTheme() {
		const selector = By.css( '.sites-navigation [data-tip-target="themes"] a[href*=customize]' );
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	async selectPlan() {
		const selector = By.css( '.sites-navigation [data-tip-target="plan"] a' );
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	async selectAddNewPage() {
		const selector = By.css( '.sites-navigation [data-post-type="page"] a.sidebar__button' );
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	async selectSiteSwitcher() {
		const siteSwitcherSelector = By.css( '.current-site__switch-sites' );
		await this.ensureSidebarMenuVisible();
		const present = await driverHelper.isEventuallyPresentAndDisplayed(
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
		const selector = By.css( '.sites-navigation .stats a' );
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	async ensureSidebarMenuVisible() {
		const allSitesSelector = By.css( '.current-section a' );
		const sidebarSelector = By.css( '.sidebar' );
		const sidebarVisible = await this.driver.findElement( sidebarSelector ).isDisplayed();

		if ( ! sidebarVisible ) {
			await driverHelper.clickWhenClickable( this.driver, allSitesSelector );
		}
		return await driverHelper.waitTillPresentAndDisplayed( this.driver, sidebarSelector );
	}

	async searchForSite( searchString ) {
		const searchSelector = By.css( '.site-selector input[type="search"]' );
		const siteSelector = By.css( `.site-selector .site a[aria-label*="${ searchString }"]` );

		const searchElement = await this.driver.findElement( searchSelector );
		const searchEnabled = await searchElement.isDisplayed();

		if ( searchEnabled ) {
			await driverHelper.setWhenSettable( this.driver, searchSelector, searchString );
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
		const selector = By.css( '.sites-navigation [data-tip-target="side-menu-plugins"] a' );
		const dismissNoticeSelector = By.css( '.notice.is-dismissable .notice__dismiss' );
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
		const dismissNoticeSelector = By.css( '.notice.is-dismissable .notice__dismiss' );
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
		const selector = By.css(
			'.sites-navigation [data-post-type="post"] a:not(.sidebar__button) span'
		);
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	async selectComments() {
		const selector = By.css( '.sites-navigation [data-post-type="comments"] a' );
		return await driverHelper.clickWhenClickable( this.driver, selector );
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
		const foundSwitcher = await driverHelper.isEventuallyPresentAndDisplayed(
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
		const surveyPage = await DisconnectSurveyPage.Expect( this.driver );
		await surveyPage.skipSurveyAndDisconnectSite();
		// Necessary to drive the loop forward
		return true;
	}

	async selectSite( siteName ) {
		const siteSelector = By.css( `.site__content[title='${ siteName }']` );
		const siteSwitcherSelector = By.css( '.current-site__switch-sites' );

		await this.ensureSidebarMenuVisible();
		const foundSwitcher = await driverHelper.isElementPresent( this.driver, siteSwitcherSelector );
		if ( ! foundSwitcher ) {
			// no site switcher, only one site
			return false;
		}
		await this.selectSiteSwitcher();
		const site = await driverHelper.isElementPresent( this.driver, siteSelector );
		if ( ! site ) {
			// site is not in present in list
			return false;
		}
		return await driverHelper.clickWhenClickable( this.driver, siteSelector );
	}
}
