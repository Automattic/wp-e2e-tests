/** @format */

import { By } from 'selenium-webdriver';
import BaseContainer from '../base-container.js';

import * as driverHelper from '../driver-helper';

export default class PostsPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.posts' ) );
	}

	waitForPosts() {
		const resultsLoadingSelector = By.css( '.posts__post-list .is-placeholder:not(.post)' );
		driverHelper.waitTillNotPresent( this.driver, resultsLoadingSelector );
	}

	waitForPostTitled( title ) {
		return driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			PostsPage._getPostXpathSelector( title )
		);
	}

	isPostDisplayed( title ) {
		return driverHelper.isElementPresent( this.driver, PostsPage._getPostXpathSelector( title ) );
	}
	editPostWithTitle( title ) {
		return driverHelper.clickWhenClickable( this.driver, PostsPage._getPostXpathSelector( title ) );
	}

	static _getPostXpathSelector( title ) {
		return By.xpath( `//div[@class='post-type-list']//a[text()= '${ title }']` );
	}
}
