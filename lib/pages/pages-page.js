import { By } from 'selenium-webdriver';
import BaseContainer from '../base-container.js';

import * as driverHelper from '../driver-helper';

export default class PagesPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '#pages' ) );
	}

	waitForPages() {
		const driver = this.driver;
		const resultsLoadingSelector = By.css( '.pages__page-list .is-placeholder:not(.page)' );
		driver.wait( function() {
			return driverHelper.isElementPresent( driver, resultsLoadingSelector ).then( function( present ) {
				return ! present;
			} );
		}, this.explicitWaitMS, 'The page results loading element was still present when it should have disappeared by now.' );
	}

	isPageDisplayed( title ) {
		const pageTitleSelector = By.linkText( `${ title }` );
		return driverHelper.isElementPresent( this.driver, pageTitleSelector );
	}
	editPageWithTitle( title ) {
		const pageTitleSelector = By.linkText( `${ title }` );
		return driverHelper.clickWhenClickable( this.driver, pageTitleSelector );
	}
}
