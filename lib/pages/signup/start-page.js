/** @format */

import { By } from 'selenium-webdriver';
import config from 'config';

import BaseContainer from '../../base-container';
import * as dataHelper from '../../data-helper';

export default class StartPage extends BaseContainer {
	constructor(
		driver,
		{ visit = true, culture = 'en', flow = '', domainFirst = false, domainFirstDomain = '' } = {}
	) {
		let url;
		if ( visit === true ) {
			let queryStrings = '';
			url = dataHelper.configGet( 'calypsoBaseURL' ) + '/start';

			if ( flow !== '' ) {
				url += '/' + flow;
			}

			if ( domainFirst === true ) {
				url += '/domain-first/site-or-domain';
				queryStrings = StartPage.appendQueryString( queryStrings, `new=${ domainFirstDomain }` );
			}

			if ( culture !== 'en' ) {
				url += '/' + culture;
			}

			if ( dataHelper.isRunningOnLiveBranch() ) {
				queryStrings = StartPage.appendQueryString(
					queryStrings,
					`branch=${ config.get( 'branchName' ) }`
				);
			}
			url += queryStrings;
		} else {
			url = driver.getCurrentUrl();
		}

		let ABTestControlFlow = flow !== '' ? flow : 'main';

		super( driver, By.css( '.step-wrapper' ), visit, url );
		this.checkForUnknownABTestKeys();
		this.setABTestControlGroupsInLocalStorage( url, culture, ABTestControlFlow );
	}

	static appendQueryString( existingQueryString, queryStringPair ) {
		if ( existingQueryString === '' ) {
			return `?${ queryStringPair }`;
		}
		return `${ existingQueryString }&${ queryStringPair }`;
	}
}
