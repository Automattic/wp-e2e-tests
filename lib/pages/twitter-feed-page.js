import { By as by } from 'selenium-webdriver';
import * as driverManager from '../driver-manager';
import BaseContainer from '../base-container';

const screenSize = driverManager.currentScreenSize();

export default class TwitterFeedPage extends BaseContainer {
	constructor( driver, twitterAccount, visit = false ) {
		let url, expectedElementSelector;
		if ( screenSize === 'mobile' ) {
			url = `https://mobile.twitter.com/${twitterAccount}`;
			expectedElementSelector = by.css( '.Timeline,#react-root' );
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

	checkTweetWithPhotoDisplayed( expectedTweetText ) {
		const driver = this.driver;
		let imageInTweetSelector;
		if ( screenSize === 'mobile' ) {
			imageInTweetSelector = by.xpath( `//div[contains(text(),"${expectedTweetText}")]/..//img[@alt="Embedded image"] | //*[contains(text(),"${expectedTweetText}")]/../../../..//img[@alt="Embedded"]` );
		} else {
			imageInTweetSelector = by.xpath( `//p[contains(text(),"${expectedTweetText}")]/../..//div[contains(@class, "AdaptiveMedia-photoContainer")]` );
		}
		return driver.wait( function() {
			driver.navigate().refresh();
			return driver.isElementPresent( imageInTweetSelector ).then( ( present ) => {
				return present;
			} );
		}, this.explicitWaitMS, 'The twitter page does not contain the expected tweet text (' + expectedTweetText + ') and image after waiting for it to appear' );
	}
};
