import webdriver, { By as by, until } from 'selenium-webdriver';
import assert from 'assert';
import BaseContainer from '../../base-container.js';

export default class GoogleSearchPage extends BaseContainer {
	constructor( driver, referenceUrl ) {
		super( driver, by.xpath( '//li[@class="ads-ad"]' ) );
		this.waitForPage();
		this.checkURL();
		this.referenceUrl = referenceUrl;

		const selector = by.xpath( '//li[@class="ads-ad"]//a[contains(@href, "' + referenceUrl +'")]' )
		this.driver.wait( until.elementLocated( selector ), this.explicitWaitMS, 'Could not locate the ad link' );
		this.adLink = this.driver.findElement( selector );
		this.driver.wait( until.elementIsVisible( this.adLink ), this.explicitWaitMS, 'Could not see ad link' );
	}

	getAdUrl() {
		var d = webdriver.promise.defer();

		this.adLink.getAttribute( 'href' ).then( ( href ) => {
			d.fulfill( href );
		} );

		return d.promise;
	}

	getAdHeadline() {
		var d = webdriver.promise.defer();

		this.adLink.getText().then( ( text ) => {
			d.fulfill( text );
		} );

		return d.promise;
	}

	getAdText() {
		var d = webdriver.promise.defer();

		var element = this.adLink.findElement( by.xpath( '../../div[@class="ads-visurl"]/cite' ) );

		element.getText().then( ( text ) => {
			d.fulfill( text );
		} );

		return d.promise;
	}

	getAdVisibleUrl() {
		var d = webdriver.promise.defer();
		var element = this.adLink.findElement( by.xpath( '../../div[contains(@class,"ads-creative")]' ) );

		element.getText().then( ( text ) => {
			d.fulfill( text );
		} );

		return d.promise;
	}

	getAdPosition() {
		var d = webdriver.promise.defer();
		this.driver.findElements( by.xpath( '//li[@class="ads-ad"]' ) ).then( ( elements ) => {
			for ( var i = 0, l = elements.length; i < l; i++ ) {
				elements[i].findElement( by.xpath( './/a[contains(@href, "' + this.referenceUrl + '")]' ) ).then( ( function( i ) {
					return function() {
						d.fulfill( i );
					};
				} )( i ), ( function( i ) {
					return function() {
						// console.log( 'Not found ' + i )
					};
				} )( i ) );
			}
		});

		return d.promise;
	}

	checkURL() {
		this.driver.getCurrentUrl().then( ( currentUrl ) => {
			assert.equal( true, currentUrl.includes( 'google.com' ), `The current url: '${ currentUrl }' does not include 'google.com'` );
		} );
	}
}
