/** @format */

import { By } from 'selenium-webdriver';
import BaseContainer from '../base-container.js';

import * as driverHelper from '../driver-helper';

export default class CommentsPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.comments' ) );
	}

	waitForComments() {
		const driver = this.driver;
		const resultsLoadingSelector = By.css( '.comment .is-placeholder' );
		driver.wait(
			() => driverHelper
			.isElementPresent( driver, resultsLoadingSelector )
			.then( present => ! present ),
			this.explicitWaitMS,
			'The comments placeholder element was still present when it should have disappeared by now.'
		);
	}
}
