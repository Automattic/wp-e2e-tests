import { By } from 'selenium-webdriver';
import BaseContainer from '../base-container.js';

import * as driverHelper from '../driver-helper';

export default class PostsPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.posts' ) );
	}

	waitForPostTitled( title ) {
		return driverHelper.waitTillPresentAndDisplayed( this.driver, PostsPage._getPostLinkSelector( title ) );
	}

	isPostDisplayed( title ) {
		return driverHelper.isElementPresent( this.driver, PostsPage._getPostLinkSelector( title ) );
	}
	editPostWithTitle( title ) {
		return driverHelper.clickWhenClickable( this.driver, PostsPage._getPostLinkSelector( title ) );
	}

	static _getPostLinkSelector( title ) {
		return By.linkText( `${ title }` );
	}
}
