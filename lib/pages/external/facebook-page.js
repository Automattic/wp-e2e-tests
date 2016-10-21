import { By as by } from 'selenium-webdriver';

import * as slackNotifier from '../../slack-notifier';

import BaseContainer from '../../base-container.js';

export default class FacebookPage extends BaseContainer {
	constructor( driver, facebookPageName, visit = false ) {
		const url = `https://www.facebook.com/${facebookPageName}/`;
		super( driver, by.css( '.fb_content' ), visit, url );
	}

	checkPostWithPhotoDisplayed( messageText ) {
		const driver = this.driver;
		const imageSelector = FacebookPage._getImageSelectorForPost( messageText );
		return driver.wait( function() {
			driver.navigate().refresh();
			return driver.isElementPresent( imageSelector ).then( ( present ) => {
				return present;
			} );
		}, this.explicitWaitMS ).then( ( ) => { }, ( ) => {
			slackNotifier.warn( `The Facebook page does not contain the expected post text ('${messageText}') with an image after waiting for it to appear. Please manually check that this eventually appears.`, { suppressDuplicateMessages: true } );
		} );
	}

	checkPostWithTextDisplayed( messageText ) {
		const driver = this.driver;
		const imageSelector = by.xpath( `//p[contains(text(), "${messageText}")]` );
		return driver.wait( function() {
			driver.navigate().refresh();
			return driver.isElementPresent( imageSelector ).then( ( present ) => {
				return present;
			} );
		}, this.explicitWaitMS ).then( ( ) => { }, ( ) => {
			slackNotifier.warn( `The Facebook page does not contain the expected post text ('${messageText}') after waiting for it to appear. Please manually check that this eventually appears.`, { suppressDuplicateMessages: true } );
		} );
	}

	// For this one we need to work out how to recognize a fake image that FB inserts as opposed to the lack of real image
	isPostWithImageImmediatelyDisplayed( messageText ) {
		const imageSelector = FacebookPage._getImageSelectorForPost( messageText );
		return this.driver.isElementPresent( imageSelector )
	}

	static _getImageSelectorForPost( messageText ) {
		return by.xpath( `//p[contains(text(), "${messageText}")]//../..//div[contains(@class, "fbStoryAttachmentImage")]` );
	}
};
