import { By as by, until } from 'selenium-webdriver';
import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

export default class ThemesPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.theme__active-focus' ) );
		this.waitUntilThemesLoaded();
	}

	showOnlyFreeThemes() {
		const self = this;
		self.driver.getCurrentUrl().then( ( url ) => {
			if ( url.indexOf( '/themes/free' ) > -1 ) {
				return true;
			}
			if ( url.indexOf( '/themes/premium' ) > -1 ) {
				const newUrl = url.replace( '/themes/premium', '/themes/free' );
				return self.driver.get( newUrl );
			}
			if ( url.indexOf( '/themes' ) > -1 ) {
				const newUrl = url.replace( '/themes', '/themes/free' );
				return self.driver.get( newUrl );
			}
			throw new Error( `Could not determine the themes URL to show only free themes. Current URL is '${url}'` );
		} );
		return this.waitUntilThemesLoaded();
	}

	selectNewTheme() {
		return driverHelper.clickWhenClickable( this.driver, by.css( '.is-actionable:not(.is-active) a' ), this.explicitWaitMS );
	}

	selectNewThemeStartingWith( phrase ) {
		const selector =  ThemesPage._getThemeSelectionXpath( phrase );
		return driverHelper.clickWhenClickable( this.driver, selector );
	}

	waitUntilThemesLoaded() {
		const selector = by.css( '.themes-list .is-placeholder' );
		const self = this;
		return self.driver.wait( function() {
			return driverHelper.isElementPresent( self.driver, selector ).then( function( present ) {
				return !present;
			} );
		}, this.explicitWaitMS, 'The themes are still loading after waiting for them' );
	}

	waitForThemeStartingWith( phrase ) {
		const selector = ThemesPage._getThemeSelectionXpath( phrase );
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
		const searchToggleSelector = by.css( '#primary div.search' );
		const searchFieldSelector = by.css( '#primary input.search__input' );
		driverHelper.clickWhenClickable( this.driver, searchToggleSelector, this.explicitWaitMS );
		driverHelper.setWhenSettable( this.driver, searchFieldSelector, phrase );
		return this.waitUntilThemesLoaded();
	}

	clickPopoverItem( name ) {
		const previewThemeSelector = by.xpath( `//*[text()='${name}']` ); // For multi-sites it's 'button', for single sites it's 'a'.  WEIRD
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

	static _getThemeSelectionXpath(phrase ) {
		return by.xpath( `//h2[text()[contains(.,'${ phrase }')]]/../../../../div[not(contains(concat(' ', @class, ' '), ' is-active '))]//span` );
	}
}
