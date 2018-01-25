import { By as by } from 'selenium-webdriver';
import config from 'config';

import BaseContainer from '../base-container.js';
import * as dataHelper from '../data-helper';
import * as driverHelper from '../driver-helper';

export default class ReaderPage extends BaseContainer {
	constructor( driver, visit = false ) {
		let url = config.get( 'calypsoBaseURL' ) + '/following/manage';
		if ( dataHelper.isRunningOnLiveBranch() ) {
			url = url + '?branch=' + config.get( 'branchName' );
		}
		super( driver, by.css( '.following-manage' ), visit, url );
	}

	waitForSites() {
		const driver = this.driver;
		const sitesLoadingSelector = by.css( '.reader-subscription-list-item  .is-placeholder:not(.reader-subscription-list-item__site-title)' );
		driver.wait( function() {
			return driverHelper.isElementPresent( driver, sitesLoadingSelector ).then( function( present ) {
				return ! present;
			} );
		}, this.explicitWaitMS, 'The sites placeholder was still present when it should have disappeared by now.' );
	}
}
