import webdriver, { By as by, until } from 'selenium-webdriver';
import assert from 'assert';
import BaseContainer from '../../base-container.js';

export default class GoogleSearchPage extends BaseContainer {
	constructor( driver, containedUrl ) {
		super( driver, by.xpath( '//*[@class="ads-ad"]' ) );
		this.waitForPage();
		this.checkURL();

		const selector = by.xpath( '//*[@class="ads-ad"]//a[contains(@href, "' + containedUrl +'")]' )
		this.driver.wait( until.elementLocated( selector ), this.explicitWaitMS, 'Could not locate the ad link' );
		this.adLink = this.driver.findElement( selector );
		this.driver.wait( until.elementIsVisible( this.adLink ), this.explicitWaitMS, 'Could not see ad link' );
	}

	getAdUrl() {
		var d = webdriver.promise.defer();

		this.adLink.getAttribute( 'href' ).then( ( href ) => {
			console.log( href );
		} );

		d.fulfill( true );
		return d.promise;
	}

	getAdHeadline() {
		var d = webdriver.promise.defer();

		this.adLink.getText().then( ( text ) => {
			console.log( text );
		} );

		d.fulfill( true );
		return d.promise;
	}

	getAdText() {
		var d = webdriver.promise.defer();

		var element = this.adLink.findElement( by.xpath( '../../div[@class="ads-visurl"]/cite' ) );

		element.getText().then( ( text ) => {
			console.log( text );
		} );

		d.fulfill( true );
		return d.promise;
	}

	getAdVisibleUrl() {
		var d = webdriver.promise.defer();
		var element = this.adLink.findElement( by.xpath( '../../div[contains(@class,"ads-creative")]' ) );

		element.getText().then( ( text ) => {
			console.log( text );
		} );

		d.fulfill( true );
		return d.promise;
	}

	checkURL() {
		this.driver.getCurrentUrl().then( ( currentUrl ) => {
			assert.equal( true, currentUrl.includes( 'google.com' ), `The current url: '${ currentUrl }' does not include 'google.com'` );
		} );
	}
}
