import { By, until } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper.js';

import BaseContainer from '../base-container.js';

export default class SidebarComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.sidebar' ) );
	}
	selectDomains() {
		let selector = By.css( '.sites-navigation .domains a' );
		return driverHelper.clickWhenClickable( this.driver, selector, this.explicitWaitMS );
	}
	selectPeople() {
		let selector = By.css( '.sites-navigation .users a' );
		return driverHelper.clickWhenClickable( this.driver, selector, this.explicitWaitMS );
	}
	selectAddPerson() {
		let selector = By.css( '.sites-navigation .users a.sidebar__button' );
		return driverHelper.clickWhenClickable( this.driver, selector, this.explicitWaitMS );
	}
	selectThemes() {
		let selector = By.css( '.sites-navigation .themes a' );
		return driverHelper.clickWhenClickable( this.driver, selector, this.explicitWaitMS );
	}
	selectPlan() {
		let selector = By.css( '.sites-navigation .upgrades-nudge a' );
		return driverHelper.clickWhenClickable( this.driver, selector, this.explicitWaitMS );
	}
	selectAddNewPage() {
		let selector = By.css( '.pages a.sidebar__button' );
		return driverHelper.clickWhenClickable( this.driver, selector, this.explicitWaitMS );
	}
	selectSiteSwitcher() {
		return driverHelper.clickWhenClickable( this.driver, By.css( '.current-site__switch-sites' ), this.explicitWaitMS );
	}
	selectAllSites() {
		return driverHelper.clickWhenClickable( this.driver, By.css( '.all-sites a' ), this.explicitWaitMS );
	}
	selectPlugins() {
		this.driver.findElement( By.css( '.sites-navigation .plugins a' ) ).click();
		return this.driver.wait( until.elementLocated( By.css( '.plugins__lists' ) ) );
	}
	selectPosts() {
		const selector = By.css( '.sites-navigation .posts a:not(.sidebar__button)' );
		return driverHelper.clickWhenClickable( this.driver, selector, this.explicitWaitMS );
	}
	customizeTheme() {
		const selector = By.css( '.sites-navigation .themes a[href*=customize]' );
		return driverHelper.clickWhenClickable( this.driver, selector, this.explicitWaitMS );
	}
}
