/** @format */

import { By } from 'selenium-webdriver';

import * as dataHelper from '../../data-helper';
import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class StartPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		const loggedOutRootURL = dataHelper.getCalypsoURL();
		super( driver, By.css( '#wpcom' ), loggedOutRootURL );
		this.startURL = url;
	}

	async _postInit() {
		await this.setABTestControlGroupsInLocalStorage();
		await this.driver.get( this.startURL );
		return await driverHelper.waitTillPresentAndDisplayed( this.driver, By.css( '.step-wrapper' ) );
	}

	static getStartURL( { culture = 'en', flow = '', query = '' } = {} ) {
		let route = 'start';
		let queryStrings = [];

		if ( flow !== '' ) {
			route += '/' + flow;
		}

		if ( culture !== 'en' ) {
			route += '/' + culture;
		}

		if ( query !== '' ) {
			queryStrings.push( query );
		}

		return dataHelper.getCalypsoURL( route, queryStrings );
	}
}
