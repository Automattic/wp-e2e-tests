/** @format */

import { By } from 'selenium-webdriver';

import * as dataHelper from '../../data-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class StartPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		super( driver, By.css( '.step-wrapper' ), url );
	}

	async _postInit() {
		return await this.setABTestControlGroupsInLocalStorage();
	}

	static getStartURL( {
		culture = 'en',
		flow = '',
		domainFirst = false,
		domainFirstDomain = '',
		query = '',
	} = {} ) {
		let route = 'start';
		let queryStrings = [];

		if ( flow !== '' ) {
			route += '/' + flow;
		}

		if ( domainFirst === true ) {
			route += '/domain-first/site-or-domain';
			queryStrings.push( `new=${ domainFirstDomain }` );
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
