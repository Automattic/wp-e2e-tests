import webdriver, { By } from 'selenium-webdriver';
import BaseContainer from '../base-container.js';

import * as driverHelper from '../driver-helper';

export default class PostsPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.posts' ) );
	}

	waitForPosts() {
		const driver = this.driver;
		const resultsLoadingSelector = By.css( '.posts__list .is-placeholder:not(.post-image)' );
		driver.wait( function() {
			return driverHelper.isElementPresent( driver, resultsLoadingSelector ).then( function( present ) {
				return ! present;
			} );
		}, this.explicitWaitMS, 'The post results loading element was still present when it should have disappeared by now.' );
	}

	isPostDisplayed( title ) {
		const postTitleSelector = By.linkText( `${ title }` );
		return driverHelper.isElementPresent( this.driver, postTitleSelector );
	}
	editPostWithTitle( title ) {
		const postTitleSelector = By.linkText( `${ title }` );
		return driverHelper.clickWhenClickable( this.driver, postTitleSelector );
	}
}
