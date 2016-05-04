import webdriver from 'selenium-webdriver';

import * as driverManager from '../driver-manager.js';

import BaseContainer from '../base-container.js';

const by = webdriver.By;
const screenSize = driverManager.currentScreenSize();

export default class TwitterFeedPage extends BaseContainer {
	constructor( driver, twitterAccount, visit = false ) {
		let url, expectedElementSelector;
		if ( screenSize === 'mobile' ) {
			url = `https://mobile.twitter.com/${twitterAccount}`;
			expectedElementSelector = by.css( '.Timeline' );
		} else {
			url = `https://twitter.com/${twitterAccount}`;
			expectedElementSelector = by.css( '#timeline' );
		}
		super( driver, expectedElementSelector, visit, url );
	}

	checkLatestTweetsContain( expectedTweetText ) {
		var driver = this.driver;
		return driver.wait( function() {
			driver.navigate().refresh();
			return driver.getPageSource().then( function( source ) {
				return ( source.indexOf( expectedTweetText ) > -1 );
			} );
		}, this.explicitWaitMS, 'The twitter page does not contain the expected tweet text (' + expectedTweetText + ') after waiting for it to appear' );
	}
};
