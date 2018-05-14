/** @format */

import { By as by, until } from 'selenium-webdriver';
import BaseContainer from '../base-container';
import * as driverHelper from '../driver-helper';
import * as dataHelper from '../data-helper';
import config from 'config';

export default class ThemesPage extends BaseContainer {
	constructor( driver, visit = false, withSignupFlow = null ) {
		let url;
		if ( visit === true ) {
			url = dataHelper.configGet( 'calypsoBaseURL' ) + '/themes';
			if ( dataHelper.isRunningOnLiveBranch() ) {
				url = url + '?branch=' + config.get( 'branchName' );
			}
		}
		super( driver, by.css( '.theme__active-focus' ), visit, url );
		this.waitUntilThemesLoaded();

		if ( withSignupFlow !== null ) {
			driver.getCurrentUrl().then( urlDisplayed => {
				this.setABTestControlGroupsInLocalStorage( urlDisplayed, { flow: withSignupFlow } );
			} );
		}
	}

	async showOnlyFreeThemes() {
		return await this.showOnlyThemesType( 'free' );
	}

	async showOnlyPremiumThemes() {
		return await this.showOnlyThemesType( 'premium' );
	}

	async showOnlyThemesType( type ) {
		await driverHelper.clickWhenClickable( this.driver, by.css( `a[data-e2e-value="${ type }"]` ) );
		return await this.waitUntilThemesLoaded();
	}

	async selectNewTheme() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.is-actionable:not(.is-active) a' ),
			this.explicitWaitMS
		);
	}

	async selectNewThemeStartingWith( phrase ) {
		const selector = ThemesPage._getThemeSelectionXpath( phrase );
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	async waitUntilThemesLoaded() {
		const selector = by.css( '.themes-list .is-placeholder' );
		const self = this;
		return await self.driver.wait(
			function() {
				return driverHelper.isElementPresent( self.driver, selector ).then( function( present ) {
					return ! present;
				} );
			},
			this.explicitWaitMS,
			'The themes are still loading after waiting for them'
		);
	}

	async waitForThemeStartingWith( phrase ) {
		const selector = ThemesPage._getThemeSelectionXpath( phrase );
		return await this.driver.wait(
			until.elementLocated( selector ),
			this.explicitWaitMS,
			'Could not locate theme beginning with: ' + phrase
		);
	}

	async clickNewThemeMoreButton() {
		const selector = by.css( '.is-actionable:not(.is-active) button' );
		let moreButtonElement = await this.driver.findElement( selector );
		await this.driver.executeScript(
			'arguments[0].scrollIntoView( { block: "center", inline: "center" } )',
			moreButtonElement
		);
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	async getFirstThemeName() {
		const selector = by.css( '.is-actionable:not(.is-active) h2' );

		await this.driver.wait(
			until.elementLocated( selector ),
			this.explicitWaitMS,
			'Could not locate the first theme element'
		);
		return await this.driver.findElement( selector ).getText();
	}

	async getActiveThemeName() {
		const selector = by.css( '.is-actionable.is-active h2' );
		await this.driver.wait(
			until.elementLocated( selector ),
			this.explicitWaitMS,
			'Could not locate the active theme element'
		);
		return await this.driver.findElement( selector ).getText();
	}

	async searchFor( phrase ) {
		const searchToggleSelector = by.css( '#primary div.search' );
		const searchFieldSelector = by.css( '#primary input.search__input' );
		await driverHelper.clickWhenClickable( this.driver, searchToggleSelector, this.explicitWaitMS );
		await driverHelper.setWhenSettable( this.driver, searchFieldSelector, phrase );
		await this.driver.findElement( searchFieldSelector ).sendKeys( ' ' );
		return await this.waitUntilThemesLoaded();
	}

	async clickPopoverItem( name ) {
		const previewThemeSelector = by.xpath( `//*[text()='${ name }']` ); // For multi-sites it's 'button', for single sites it's 'a'.  WEIRD
		await this.driver.wait(
			until.elementLocated( previewThemeSelector ),
			this.explicitWaitMS,
			`Could not locate the ${ name } theme menu option`
		);
		this.previewThemeElement = await this.driver.findElement( previewThemeSelector );
		await this.driver.wait(
			until.elementIsVisible( this.previewThemeElement ),
			this.explicitWaitMS,
			`The ${ name } theme menu option is not visible`
		);
		return await driverHelper.clickWhenClickable(
			this.driver,
			previewThemeSelector,
			this.explicitWaitMS
		);
	}

	async popOverMenuDisplayed() {
		const popOverMenuSelector = by.css( '.popover__menu' );
		await this.driver.wait(
			until.elementLocated( popOverMenuSelector ),
			this.explicitWaitMS,
			'Could not locate the pop over menu'
		);
		return await this.driver.findElement( popOverMenuSelector ).isDisplayed();
	}

	static _getThemeSelectionXpath( phrase ) {
		let lowerCasedPhrase = phrase.toLowerCase().replace( ' ', '-' );
		return by.css( `div[data-e2e-theme*='${ lowerCasedPhrase }']:not(.is-active) span` );
	}
}
