import { By as by } from 'selenium-webdriver';
import config from 'config';

import BaseContainer from '../base-container.js';
import * as dataHelper from '../data-helper';
import * as driverHelper from '../driver-helper';

export default class ReaderSearchPage extends BaseContainer {
	constructor( driver, visit = false ) {
		let url = config.get( 'calypsoBaseURL' ) + '/read/search';
		if ( dataHelper.isRunningOnLiveBranch() ) {
			url = url + '?branch=' + config.get( 'branchName' );
		}
		super( driver, by.css( '.search-stream' ), visit, url );
	}

	waitForRecommendations() {
		const driver = this.driver;
		const sitesLoadingSelector = by.css( '.search-stream__recommendation-list-item  .is-placeholder:not(.reader-related-card-v2)' );
		driver.wait( function() {
			return driverHelper.isElementPresent( driver, sitesLoadingSelector ).then( function( present ) {
				return ! present;
			} );
		}, this.explicitWaitMS, 'The search recommendations placeholder was still present when it should have disappeared by now.' );
	}
}
