/** @format */

import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container';

import * as driverHelper from '../driver-helper';

export default class PostsPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.posts' ) );
	}

	async waitForPosts() {
		const resultsLoadingSelector = By.css( '.posts__post-list .is-placeholder:not(.post)' );
		return await driverHelper.waitTillNotPresent( this.driver, resultsLoadingSelector );
	}

	async waitForPostTitled( title ) {
		return await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			PostsPage.getPostTitleSelector( title )
		);
	}

	async isPostDisplayed( title ) {
		return await driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			PostsPage.getPostTitleSelector( title )
		);
	}

	async editPostWithTitle( title ) {
		return await driverHelper.clickWhenClickable(
			this.driver,
			PostsPage.getPostTitleSelector( title ),
			this.explicitWaitMS * 2
		);
	}

	async successNoticeDisplayed() {
		return await driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			By.css( '.notice.is-success' )
		);
	}

	static getPostTitleSelector( title ) {
		return By.css( `.post-item__title-link[data-e2e-title="${ title }"]` );
	}
}
