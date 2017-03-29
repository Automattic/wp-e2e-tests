import webdriver, { By as by, until } from 'selenium-webdriver';
import assert from 'assert';
import BaseContainer from '../../base-container.js';

export default class GoogleSearchPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.xpath( '//*[@class="ads-ad"]' ) );
		this.waitForPage();
		this.checkURL();
	}

	getAdUrl( containedUrl ) {
		var d = webdriver.promise.defer();
		const selector = by.xpath( '//*[@class="ads-ad"]//a[contains(@href, "' + containedUrl +'")]' )
		this.driver.wait( until.elementLocated( selector ), this.explicitWaitMS, 'Could not locate the ad link' );
		const adLink = this.driver.findElement( selector );
		this.driver.wait( until.elementIsVisible( adLink ), this.explicitWaitMS, 'Could not see ad link' );

		adLink.getAttribute( 'href' ).then( ( href ) => {
			console.log(href);
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
