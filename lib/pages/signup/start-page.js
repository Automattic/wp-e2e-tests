import { By } from 'selenium-webdriver';
import config from 'config';

import BaseContainer from '../../base-container';
import LoginPage from '../login-page';
import * as dataHelper from '../../data-helper';

export default class StartPage extends BaseContainer {
	constructor( driver, { visit = true, culture = 'en', flow = '', domainFirst = false, domainFirstDomain = '' } = {} ) {
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
				queryStrings = StartPage.appendQueryString( queryStrings, `branch=${ config.get( 'branchName' ) }` );
			}
			url += queryStrings;
		} else {
			url = driver.getCurrentUrl().then( ( urlDisplayed ) => {
				return urlDisplayed;
			} );
		}

		let ABTestControlFlow = flow !== '' ? flow : 'main';

		// use loginPage to set control groups so that start page already has them set upon visit
		let loginPage = new LoginPage( driver, true );
		loginPage.setABTestControlGroupsInLocalStorage( LoginPage.getLoginURL(), culture, ABTestControlFlow );

		super( driver, By.css( '.step-wrapper' ), visit, url );
		this.checkForUnknownABTestKeys();
	}

	static appendQueryString( existingQueryString, queryStringPair ) {
		if ( existingQueryString === '' ) {
			return `?${ queryStringPair }`;
		}
		return `${ existingQueryString }&${ queryStringPair }`;
	}
}
