/** @format */

import webdriver, { By as by, until } from 'selenium-webdriver';
import BaseContainer from '../../base-container.js';

export default class GoogleSearchPage extends BaseContainer {
	constructor( driver, referenceUrl ) {
		const frame = by.css( 'iframe.iframe-preview' );
		super( driver, frame );
		this.referenceUrl = referenceUrl;

		const iframe = this.driver.findElement( frame );
		driver.switchTo().frame( iframe );

		const selector = by.xpath(
			'//li[@class="ads-ad"]//a[contains(@href, "' + referenceUrl + '")]'
		);
		this.driver.wait(
			until.elementLocated( selector ),
			this.explicitWaitMS,
			'Could not locate the ad link'
		);
		this.adLink = this.driver.findElement( selector );
	}

	adExists() {
		this.driver.wait(
			until.elementIsVisible( this.adLink ),
			this.explicitWaitMS,
			'Could not see ad link'
		);
		return true;
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
		return this.adLink
			.findElement( by.xpath( '../../div[contains(@class,"ads-creative")]' ) )
			.getText();
	}

	getAdPosition() {
		var d = webdriver.promise.defer();

		this.driver
			.findElement( by.css( "li.ads-ad a[href*='wordpress.com']" ) )
			.then( el => el.getAttribute( 'id' ).then( id => d.fulfill( id.susbtr( 1 ) ) ) );

		return d.promise;
	}
}
