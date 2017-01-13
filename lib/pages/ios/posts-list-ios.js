import BaseContainerMobile from '../../base-container-mobile.js';
import webdriver from 'selenium-webdriver';
import assert from 'assert';
const By = webdriver.By;

import * as driverHelper from '../../driver-helper.js';

export default class PostsListPage extends BaseContainerMobile {
	constructor( driver ) {
		super( driver, By.xpath( '//XCUIElementTypeTable[@name="PostsTable"]' ) );

		this.searchBarSelector = By.xpath( '//XCUIElementTypeOther[@name="Search"]' );
	}

	findPost( title ) {
		const driver = this.driver;

		return driverHelper.setWhenSettableMobile( driver, this.searchBarSelector, title ).then( () => {
			// This is actually returning the PostsTable itself, which isn't ideal but good enough verification for now.
			// Need to get real accessibility IDs applied to individual posts, but thus far I've been unsuccessful -- SRS -- 04Jan16
			const postElementSelector = By.xpath( `//XCUIElementTypeTable[starts-with(@label, "${title}")]` );

			return driverHelper.scrollToFindElement( driver, postElementSelector, { maxSwipes: 0 } ).then( () => {
				return true;
			}, () => {
				assert( false, `Unable to find post '${title}'` );
			} );
		} );
	}
}
