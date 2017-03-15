import { By as by } from 'selenium-webdriver';
import * as driverManager from '../driver-manager';
import * as slackNotifier from '../slack-notifier';
import BaseContainer from '../base-container';

import * as driverHelper from '../driver-helper.js';

const screenSize = driverManager.currentScreenSize();

export default class TwitterFeedPage extends BaseContainer {
	constructor( driver, twitterAccount, visit = false ) {
		let url, expectedElementSelector;
		url = `https://twitter.com/${twitterAccount}`;
		expectedElementSelector = by.css( '#timeline' );

		super( driver, expectedElementSelector, visit, url );
	}

	checkLatestTweetsContain( expectedTweetText ) {
		var driver = this.driver;
		return driver.wait( function() {
			driver.navigate().refresh();
			return driver.getPageSource().then( function( source ) {
				return ( source.indexOf( expectedTweetText ) > -1 );
			} );
		}, this.explicitWaitMS ).then( ( ) => { }, ( ) => {
			slackNotifier.warn( `The twitter page does not contain the expected tweet text ('${expectedTweetText}') after waiting for it to appear. Please manually check that this eventually appears.`, { suppressDuplicateMessages: true } );
		} );
	}

	checkTweetWithTextAppears( expectedTweetText ) {
		const driver = this.driver;
		let tweetSelector = this._getSelectorForTweetNotIncludingTheImage( expectedTweetText );
		return driver.wait( function() {
			driver.navigate().refresh();
			return driverHelper.isElementPresent( driver, tweetSelector ).then( ( present ) => {
				return present;
			} );
		}, this.explicitWaitMS ).then( ( ) => { }, ( ) => {
			slackNotifier.warn( `The twitter page does not contain the expected tweet text ('${expectedTweetText}') after waiting for it to appear. Please manually check that this eventually appears.`, { suppressDuplicateMessages: true } );
		} );
	}

	checkTweetWithPhotoDisplayed( expectedTweetText ) {
		const driver = this.driver;
		const imageInTweetSelector = this._getSelectorForTweetWithImage( expectedTweetText );
		return driver.wait( function() {
			driver.navigate().refresh();
			driverHelper.isElementPresent( driver, imageInTweetSelector ).then( ( present ) => {
				return present;
			} );
		}, this.explicitWaitMS ).then( ( ) => { }, ( ) => {
			slackNotifier.warn( `The twitter page does not contain the expected tweet text ('${expectedTweetText}') and an image after waiting for it to appear. Please manually check that this eventually appears.`, { suppressDuplicateMessages: true } );
		} );
	}

	isTweetWithPhotoImmediatelyDisplayed( expectedTweetText ) {
		return driverHelper.isElementPresent( this.driver, this._getSelectorForTweetWithImage( expectedTweetText ) );
	}

	_getSelectorForTweetWithImage( tweetText ) {
		let imageInTweetSelector;
		if ( screenSize === 'mobile' ) {
			const xpath = `//div[contains(text(),"${tweetText}")]/..//img[@alt="Embedded image"] | //*[contains(text(),"${tweetText}")]/../../../..//img[@alt="Embedded"]`;
			imageInTweetSelector = by.xpath( xpath );
		} else {
			const xpath = `//p[contains(text(),"${tweetText}")]/../..//div[contains(@class, "AdaptiveMedia-photoContainer")]`;
			imageInTweetSelector = by.xpath( xpath );
		}
		return imageInTweetSelector;
	}

	_getSelectorForTweetNotIncludingTheImage( tweetText ) {
		let tweetSelector;
		if ( screenSize === 'mobile' ) {
			const xpath = `//div[contains(text(),"${tweetText}")] | //*[contains(text(),"${tweetText}")]`;
			tweetSelector = by.xpath( xpath );
		} else {
			const xpath = `//p[contains(text(),"${tweetText}")]`;
			tweetSelector = by.xpath( xpath );
		}
		return tweetSelector;
	}
};
