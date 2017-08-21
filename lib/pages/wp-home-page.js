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
	setRegularView( culture ) {
		this.driver.manage().deleteCookie( 'wp_locale_test_group' );
		this.driver.manage().addCookie( {
			name: 'wp_locale_test_group',
			path: '/',
			value: localizationData[ culture ].wpcom_base_url
		} );
		this.driver.navigate().refresh();
		this.waitForPage();
	}
	setSandboxModeForPayments( sandboxCookieValue ) {
		var setCookieCode = function( sandboxValue ) {
			window.document.cookie = 'store_sandbox=' + sandboxValue + ';domain=.wordpress.com';
		};
		return this.driver.executeScript( setCookieCode, sandboxCookieValue );
	}
	createWebSite() {
		var d = webdriver.promise.defer();
		this.driver.findElement( by.id( 'top-create-website-button' ) ).click();
		d.fulfill( true );
		return d.promise;
	}
	checkURL( culture ) {
		const target = culture ?
			localizationData[ culture ].wpcom_base_url :
			'wordpress.com';
		this.driver.getCurrentUrl().then( ( currentUrl ) => {
			assert.equal( true, currentUrl.includes( target ), `The current url: '${ currentUrl }' does not include ${ target }` );
		} );
	}
}
