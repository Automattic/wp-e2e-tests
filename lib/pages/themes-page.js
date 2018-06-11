/** @format */

import { By as by } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper';
import * as dataHelper from '../data-helper';
import config from 'config';

export default class ThemesPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		super( driver, by.css( '.theme__active-focus' ), url );
	}

	static getStartURL() {
		let url;
		url = dataHelper.configGet( 'calypsoBaseURL' ) + '/themes';
		if ( dataHelper.isRunningOnLiveBranch() ) {
			url = url + '?branch=' + config.get( 'branchName' );
		}
		return url;
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
			by.css( '.is-actionable:not(.is-active) a' )
		);
	}

	async selectNewThemeStartingWith( phrase ) {
		const selector = ThemesPage._getThemeSelectionXpath( phrase );
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	async waitUntilThemesLoaded() {
		return await driverHelper.waitTillNotPresent(
			this.driver,
			by.css( '.themes-list .is-placeholder' )
		);
	}

	async waitForThemeStartingWith( phrase ) {
		const selector = ThemesPage._getThemeSelectionXpath( phrase );
		return driverHelper.waitTillPresentAndDisplayed( this.driver, selector );
	}

	async clickNewThemeMoreButton() {
		const selector = by.css( '.is-actionable:not(.is-active) button' );

		await driverHelper.scrollIntoView( this.driver, selector );
		return await driverHelper.clickWhenClickable( this.driver, selector );
	}

	async getFirstThemeName() {
		const selector = by.css( '.is-actionable:not(.is-active) h2' );
		driverHelper.waitTillPresentAndDisplayed( this.driver, selector );
		return await this.driver.findElement( selector ).getText();
	}

	async getActiveThemeName() {
		const selector = by.css( '.is-actionable.is-active h2' );
		driverHelper.waitTillPresentAndDisplayed( this.driver, selector );
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
		driverHelper.waitTillPresentAndDisplayed( this.driver, previewThemeSelector );
		return await driverHelper.clickWhenClickable( this.driver, previewThemeSelector );
	}

	async popOverMenuDisplayed() {
		const popOverMenuSelector = by.css( '.popover__menu' );
		return driverHelper.isEventuallyPresentAndDisplayed( this.driver, popOverMenuSelector );
	}

	static _getThemeSelectionXpath( phrase ) {
		let lowerCasedPhrase = phrase.toLowerCase().replace( ' ', '-' );
		return by.css( `div[data-e2e-theme*='${ lowerCasedPhrase }']:not(.is-active) span` );
	}
}
