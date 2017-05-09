import { By, until } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper.js';

import BaseContainer from '../base-container.js';

export default class SidebarComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.sidebar' ) );
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
	selectAddPlugin() {
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
		let selector = By.css( '.pages a.sidebar__button' );
		return driverHelper.clickWhenClickable( this.driver, selector );
	}
	selectSiteSwitcher() {
		return driverHelper.clickWhenClickable( this.driver, By.css( '.current-site__switch-sites' ) );
	}
	selectAllSites() {
		return driverHelper.clickWhenClickable( this.driver, By.css( '.all-sites a' ) );
	}
	selectViewThisSite() {
		return driverHelper.clickWhenClickable( this.driver, By.css( 'a[data-tip-target="site-card-preview"]' ) );
	}
	selectPlugins() {
		this.driver.findElement( By.css( '.sites-navigation .plugins a' ) ).click();
		return this.driver.wait( until.elementLocated( By.css( '.plugins__lists' ) ) );
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
}
