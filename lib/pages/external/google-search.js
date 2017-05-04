import webdriver, { By as by, until } from 'selenium-webdriver';
import assert from 'assert';
import BaseContainer from '../../base-container.js';

export default class GoogleSearchPage extends BaseContainer {
	constructor( driver, referenceUrl ) {
		super( driver, by.css( 'li.ads-ad' ) );
		this.waitForPage();
		this.checkURL();
		this.referenceUrl = referenceUrl;

		const selector = by.xpath( '//li[@class="ads-ad"]//a[contains(@href, "' + referenceUrl +'")]' )
		this.driver.wait( until.elementLocated( selector ), this.explicitWaitMS, 'Could not locate the ad link' );
		this.adLink = this.driver.findElement( selector );
		this.driver.wait( until.elementIsVisible( this.adLink ), this.explicitWaitMS, 'Could not see ad link' );
	}

	getAdUrl() {
		return this.adLink.getAttribute( 'href' );
	}

	getAdHeadline() {
		return this.adLink.getText();
	}

	getAdText() {
		return this.adLink.findElement( by.xpath( '../../div[@class="ads-visurl"]/cite' ) ).getText();
	}

	getAdVisibleUrl() {
		return this.adLink.findElement( by.xpath( '../../div[contains(@class,"ads-creative")]' ) ).getText();
	}

	getAdPosition() {
		var d = webdriver.promise.defer();

		this.driver.findElement( by.css( `li.ads-ad a[href*='wordpress.com']` ) ).then( ( el ) => {
			el.getAttribute( 'id' ).then( ( id ) => {
				// Google uses id=p1 for the first ad, p2 for the second, etc.
				d.fulfill( id.susbtr( 1 ) );
			} );
		} );

		return d.promise;
	}

	checkURL() {
		this.driver.getCurrentUrl().then( ( currentUrl ) => {
			assert.equal( true, currentUrl.includes( 'google.' ), `The current url: '${ currentUrl }' does not include 'google.'` );
		} );
	}
}
