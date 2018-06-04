/** @format */

import webdriver from 'selenium-webdriver';
import assert from 'assert';
import BaseContainer from '../base-container.js';
import localizationData from '../../localization-data.json';

const by = webdriver.By;

export default class WPHomePage extends BaseContainer {
	constructor( driver, { visit = false, culture = 'en', setRegularView = false } = {} ) {
		super( driver, by.css( 'body' ), visit, 'https://wordpress.com/' );
		if ( setRegularView === true ) {
			this.setRegularView( culture );
		}
		this.checkURL();
	}

	async setRegularView( culture ) {
		await this.driver.manage().deleteCookie( 'wp_locale_test_group' );
		await this.driver.manage().addCookie( {
			name: 'wp_locale_test_group',
			path: '/',
			value: localizationData[ culture ].wpcom_base_url,
		} );
		await this.driver.navigate().refresh();
		return await this.waitForPage();
	}

	async setSandboxModeForPayments( sandboxCookieValue ) {
		const setCookieCode = function( sandboxValue ) {
			window.document.cookie = 'store_sandbox=' + sandboxValue + ';domain=.wordpress.com';
		};
		await this.driver.executeScript( setCookieCode, sandboxCookieValue );
		return true;
	}

	async setCurrencyForPayments( currency ) {
		const setCookieCode = function( currencyValue ) {
			window.document.cookie = 'landingpage_currency=' + currencyValue + ';domain=.wordpress.com';
		};
		return await this.driver.executeScript( setCookieCode, currency );
	}

	async checkURL( culture ) {
		const target = culture ? localizationData[ culture ].wpcom_base_url : 'wordpress.com';
		let currentUrl = await this.driver.getCurrentUrl();
		return assert.equal(
			true,
			currentUrl.includes( target ),
			`The current url: '${ currentUrl }' does not include ${ target }`
		);
	}
}
