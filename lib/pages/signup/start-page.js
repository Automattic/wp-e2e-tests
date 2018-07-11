/** @format */

import { By } from 'selenium-webdriver';
import config from 'config';

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
		query = ''
	} = {} ) {
		let url;
		let queryStrings = '';
		url = dataHelper.configGet( 'calypsoBaseURL' ) + '/start';

		if ( flow !== '' ) {
			url += '/' + flow;
		}

		if ( domainFirst === true ) {
			url += '/domain-first/site-or-domain';
			queryStrings = StartPage._appendQueryString( queryStrings, `new=${ domainFirstDomain }` );
		}

		if ( culture !== 'en' ) {
			url += '/' + culture;
		}

		if ( dataHelper.isRunningOnLiveBranch() ) {
			queryStrings = StartPage._appendQueryString(
				queryStrings,
				`hash=${ config.get( 'commitHash' ) }`
			);
		}

		if ( query !== '' ) {
			queryStrings = StartPage._appendQueryString(
				queryStrings,
				query
			);
		}

		url += queryStrings;
		return url;
	}

	static _appendQueryString( existingQueryString, queryStringPair ) {
		if ( existingQueryString === '' ) {
			return `?${ queryStringPair }`;
		}
		return `${ existingQueryString }&${ queryStringPair }`;
	}
}
