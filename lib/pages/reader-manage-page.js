/** @format */

import { By as by } from 'selenium-webdriver';
import config from 'config';

import BaseContainer from '../base-container.js';
import * as dataHelper from '../data-helper';
import * as driverHelper from '../driver-helper';

export default class ReaderPage extends BaseContainer {
	constructor( driver, visit = false ) {
		let url = dataHelper.configGet( 'calypsoBaseURL' ) + '/following/manage';
		if ( dataHelper.isRunningOnLiveBranch() ) {
			url = url + '?branch=' + config.get( 'branchName' );
		}
		super( driver, by.css( '.following-manage' ), visit, url );
		this.recommendedSitesSection = by.css( '.reader-recommended-sites' );
		this.followedSitesSection = by.css( '.following-manage__subscriptions' );
	}

	waitForSites() {
		const sitesLoadingSelector = by.css(
			'.reader-subscription-list-item  .is-placeholder:not(.reader-subscription-list-item__site-title)'
		);

		return driverHelper.waitTillNotPresent( this.driver, sitesLoadingSelector );
	}
}
