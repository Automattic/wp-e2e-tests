import { By as by } from 'selenium-webdriver';

import BaseContainer from '../base-container.js';

import * as driverHelper from '../driver-helper.js';

export default class ViewSitePage extends BaseContainer {
	constructor( driver, visit = false, url = null ) {
		super( driver, by.css( '.home' ), visit, url );
	}

	viewFirstPost() {
		return driverHelper.clickWhenClickable( this.driver, by.css( '.entry-title a' ) );
	}

	siteTitle() {
		return this.driver.findElement( by.css( '.site-title' ) ).getText();
	}

	siteTagline() {
		return this.driver.findElement( by.css( '.site-description' ) ).getText();
	}

	sharingButtonShown( service ) {
		const selector = by.css( `a.share-${service}` );
		return driverHelper.isEventuallyPresentAndDisplayed( this.driver, selector );
	}

	sharingButtonLink( service ) {
		const selector = by.css( `a.share-${service}` );
		return this.driver.findElement( selector ).then( ( element ) => {
			return element.getAttribute( 'href' );
		} );
	}
}
