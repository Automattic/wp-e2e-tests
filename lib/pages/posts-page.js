import { By } from 'selenium-webdriver';
import BaseContainer from '../base-container.js';

import * as driverHelper from '../driver-helper';

export default class PostsPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.posts' ) );
	}

	waitForPosts() {
		const driver = this.driver;
		const postSelector = By.css( '.post-item' );
		return driverHelper.waitForInfiniteListLoad( driver, postSelector, { numElements: 30 } );
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
