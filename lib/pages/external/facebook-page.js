import { By as by } from 'selenium-webdriver';

import BaseContainer from '../../base-container.js';

export default class FacebookPage extends BaseContainer {
	constructor( driver, facebookPageName, visit = false ) {
		const url = `https://www.facebook.com/${facebookPageName}/`;
		super( driver, by.css( '.fb_content' ), visit, url );
	}

	checkPostWithPhotoDisplayed( messageText ) {
		const driver = this.driver;
		const imageSelector = by.xpath( `//p[contains(text(), "${messageText}")]//../..//div[contains(@class, "fbStoryAttachmentImage")]` );
		return driver.wait( function() {
			driver.navigate().refresh();
			return driver.isElementPresent( imageSelector ).then( ( present ) => {
				return present;
			} );
		}, this.explicitWaitMS, 'The Facebook page does not contain the expected post text (' + messageText + ') and image after waiting for it to appear' );
	}
};
