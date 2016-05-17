import webdriver from 'selenium-webdriver';
import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

const by = webdriver.By;
const until = webdriver.until;

export default class PluginDetailsPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.plugin__page' ) );
		this.successNoticeSelector = by.css( '.notice.is-success' );
	}

	clickActivateToggleForPlugin( pluginSlug, siteId ) {
		const selector = PluginDetailsPage._getActivateElementSelector( pluginSlug, siteId );
		return driverHelper.clickWhenClickable( this.driver, selector, this.explicitWaitMS );
	}

	waitForPlugin( pluginSlug, siteId ) {
		const selector = PluginDetailsPage._getActivateElementSelector( pluginSlug, siteId );
		return this.driver.wait( until.elementLocated( selector, this.explicitWaitMS, `Could not locate the activate plugin link for the '${pluginSlug}' plugin` ) );
	}

	viewPlugin( pluginSlug ) {
		const pluginSelector = by.css( `a.plugin-item__link[href*='${pluginSlug}']` );
		return driverHelper.clickWhenClickable( this.driver, pluginSelector );
	}

	waitForSuccessNotice() {
		this.driver.wait( until.elementLocated( this.successNoticeSelector ), this.explicitWaitMS, 'Could not locate the success notice. Check that is is displayed.' );
	}

	getSuccessNoticeText() {
		return this.driver.findElement( this.successNoticeSelector ).getText();
	}

	ensureDeactivated( pluginSlug, siteId ) {
		const driver = this.driver;
		const activateSelector = PluginDetailsPage._getActivateElementSelector( pluginSlug, siteId );
		return driver.findElement( activateSelector ).getAttribute( 'aria-checked' ).then( ( active ) => {
			if ( active === 'true' ) {
				driverHelper.clickWhenClickable( this.driver, activateSelector );
				return this.waitForSuccessNotice();
			}
		} );
	}

	goBack() {
		return driverHelper.clickWhenClickable( this.driver, by.css( '.header-cake__back' ) );
	}

	static _getActivateElementSelector( pluginSlug, siteId ) {
		return by.id( `activate-${pluginSlug}-${siteId}` );
	}
}
