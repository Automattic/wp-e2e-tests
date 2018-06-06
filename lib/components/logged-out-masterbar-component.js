/** @format */

import { By } from 'selenium-webdriver';

import AsyncBaseContainer from '../async-base-container';

export default class LoggedOutMasterbarComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.masterbar__login-links,.masterbar .nav' ) );
	}

	static async IsExpected( driver ) {
		const page = new LoggedOutMasterbarComponent( driver );
		await page.expectInit();
		return page;
	}
}
