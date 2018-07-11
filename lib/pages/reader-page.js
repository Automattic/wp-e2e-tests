/** @format */

import { By as by } from 'selenium-webdriver';
import config from 'config';
import URL from 'url';

import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper.js';
import * as dataHelper from '../data-helper';
import * as eyesHelper from '../eyes-helper';

export default class ReaderPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		if ( ! url ) {
			url = ReaderPage.getReaderURL();
		}
		super( driver, by.css( '.is-section-reader' ), url );
	}

	async siteOfLatestPost() {
		let href = await this.driver
			.findElement( by.css( '.reader-visit-link' ) )
			.getAttribute( 'href' );
		return URL.parse( href ).host;
	}

	async commentOnLatestPost( comment, eyes ) {
		await driverHelper.clickWhenClickable( this.driver, by.css( '.comment-button' ) );
		await driverHelper.setWhenSettable(
			this.driver,
			by.css( '.comments__form textarea' ),
			comment
		);
		await eyesHelper.eyesScreenshot( this.driver, eyes, 'Single Post View' );
		return await driverHelper.clickWhenClickable( this.driver, by.css( '.comments__form button' ) );
	}

	static getReaderURL() {
		let url = dataHelper.configGet( 'calypsoBaseURL' ) + '/read';
		if ( dataHelper.isRunningOnLiveBranch() ) {
			url = url + '?hash=' + config.get( 'commitHash' );
		}
		return url;
	}
}
