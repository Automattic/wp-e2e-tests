import { By as by, until } from 'selenium-webdriver';
import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

export default class ThemesPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.theme__active-focus' ) );
	}

	showOnlyFreeThemes() {
		const self = this;
		return self.driver.getCurrentUrl().then( ( url ) => {
			if ( url.indexOf( '/design/type/free' ) > -1 ) {
				return true;
			}
			if ( url.indexOf( '/design/type/all' ) > -1 ) {
				const newUrl = url.replace( '/design/type/all', '/design/type/free' );
				return self.driver.get( newUrl );
			}
			if ( url.indexOf( '/design/type/premium' ) > -1 ) {
				const newUrl = url.replace( '/design/type/premium', '/design/type/free' );
				return self.driver.get( newUrl );
			}
			if ( url.indexOf( '/design' ) > -1 ) {
				const newUrl = url.replace( '/design', '/design/type/free' );
				return self.driver.get( newUrl );
			}
			throw new Error( `Could not determine the themes URL to show only free themes. Current URL is '${url}'` );
		} );
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
