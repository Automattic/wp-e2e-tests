import { By } from 'selenium-webdriver';
import BaseContainer from '../base-container.js';

import * as driverHelper from '../driver-helper';

export default class PostsPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.posts' ) );
	}

	waitForPosts() {
		const driver = this.driver;
		const resultsLoadingSelector = By.css( '.posts__post-list .is-placeholder:not(.post)' );
		driver.wait( function() {
			return driverHelper.isElementPresent( driver, resultsLoadingSelector ).then( function( present ) {
				return ! present;
			} );
		}, this.explicitWaitMS, 'The posts loading element was still present when it should have disappeared by now.' );
	}

	waitForPostTitled( title ) {
		return driverHelper.waitTillPresentAndDisplayed( this.driver, PostsPage._getPostXpathSelector( title ) );
	}

	isPostDisplayed( title ) {
		return driverHelper.isElementPresent( this.driver, PostsPage._getPostXpathSelector( title ) );
	}
	editPostWithTitle( title ) {
		return driverHelper.clickWhenClickable( this.driver, PostsPage._getPostXpathSelector( title ) );
	}

	static _getPostXpathSelector( title ) {
		return By.xpath( `//div[@class='post-type-list']//a[text()= '${title}']` );
	}
}
