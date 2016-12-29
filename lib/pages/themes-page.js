import { By as by, until } from 'selenium-webdriver';
import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

export default class ThemesPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.theme__active-focus' ) );
		this.allThemesSelector = by.css( 'a.item-index-0' );
		this.freeThemesSelector = by.css( 'a.item-index-1' );
		this.premiumThemesSelector = by.css( 'a.item-index-2' );
	}

	showOnlyFreeThemes() {
		const self = this;
		return driverHelper.clickWhenClickable( this.driver, this.freeThemesSelector, this.explicitWaitMS );
	}

	selectNewTheme() {
		return driverHelper.clickWhenClickable( this.driver, by.css( '.is-actionable:not(.is-active) a' ), this.explicitWaitMS );
	}

	selectNewThemeStartingWith( phrase ) {
		const selector = by.xpath( `//h2[text()[contains(.,'${ phrase }')]]/../../../../div[not(contains(concat(' ', @class, ' '), ' is-active '))]` );
		return driverHelper.clickWhenClickable( this.driver, selector );
	}

	waitForThemeStartingWith( phrase ) {
		const selector = by.xpath( `//h2[text()[contains(.,'${ phrase }')]]/../../../../div[not(contains(concat(' ', @class, ' '), ' is-active '))]` );
		return this.driver.wait( until.elementLocated( selector ), this.explicitWaitMS, 'Could not locate theme beginning with: ' + phrase );
	}

	clickNewThemeMoreButton() {
		return driverHelper.clickWhenClickable( this.driver, by.css( '.is-actionable:not(.is-active) button' ) );
	}

	getFirstThemeName() {
		const selector = by.css( '.is-actionable:not(.is-active) h2' );

		this.driver.wait( until.elementLocated( selector ), this.explicitWaitMS, 'Could not locate the first theme element' );
		return this.driver.findElement( selector ).getText();
	}

	getActiveThemeName() {
		const selector = by.css( '.is-actionable.is-active h2' );
		this.driver.wait( until.elementLocated( selector ), this.explicitWaitMS, 'Could not locate the active theme element' );
		return this.driver.findElement( selector ).getText();
	}

	searchFor( phrase ) {
		const searchToggleSelector = by.css( 'div.themes__search-card div.search' );
		const searchFieldSelector = by.css( '.themes__search-card .search input' );
		driverHelper.clickWhenClickable( this.driver, searchToggleSelector, this.explicitWaitMS );
		driverHelper.waitForFieldClearable( this.driver, searchFieldSelector, this.explicitWaitMS );
		return this.driver.findElement( searchFieldSelector ).sendKeys( phrase );
	}

	clickPopoverItem( name ) {
		const previewThemeSelector = by.xpath( `//button[text()='${name}']` );
		this.driver.wait( until.elementLocated( previewThemeSelector ), this.explicitWaitMS, `Could not locate the ${name} theme menu option` );
		this.previewThemeElement = this.driver.findElement( previewThemeSelector );
		this.driver.wait( until.elementIsVisible( this.previewThemeElement ), this.explicitWaitMS, `The ${name} theme menu option is not visible` );
		return driverHelper.clickWhenClickable( this.driver, previewThemeSelector, this.explicitWaitMS );
	}

	popOverMenuDisplayed() {
		const popOverMenuSelector = by.css( '.popover__menu' );
		this.driver.wait( until.elementLocated( popOverMenuSelector ), this.explicitWaitMS, 'Could not locate the pop over menu' );
		return this.driver.findElement( popOverMenuSelector ).isDisplayed();
	}
}
