/** @format */

import { By } from 'selenium-webdriver';
import BaseContainer from '../base-container.js';

import * as driverHelper from '../driver-helper';

export default class CommentsPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.comments' ) );
	}

	waitForComments() {
		const resultsLoadingSelector = By.css( '.comment .is-placeholder' );

		return driverHelper.waitTillNotPresent( this.driver, resultsLoadingSelector );
	}
}
