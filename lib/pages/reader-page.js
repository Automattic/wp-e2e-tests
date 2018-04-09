/** @format */

import { By as by } from 'selenium-webdriver';
import config from 'config';
import URL from 'url';

import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';
import * as dataHelper from '../data-helper';
import * as eyesHelper from '../eyes-helper';

export default class ReaderPage extends BaseContainer {
	constructor( driver, visit = false ) {
		let url = dataHelper.configGet( 'calypsoBaseURL' ) + '/read';
		if ( dataHelper.isRunningOnLiveBranch() ) {
			url = url + '?branch=' + config.get( 'branchName' );
		}
		super( driver, by.css( '.is-section-reader' ), visit, url );
	}

	siteOfLatestPost() {
		return this.driver
			.findElement( by.css( '.reader-visit-link' ) )
			.getAttribute( 'href' )
			.then( href => {
				return URL.parse( href ).host;
			} );
	}

	likeLatestPost() {
		return driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.reader-post-card .like-button' )
		);
	}

	latestPostIsLiked() {
		return this.driver
			.findElement( by.css( '.reader-post-card .like-button' ) )
			.getAttribute( 'class' )
			.then( classNames => {
				return classNames.includes( 'is-liked' );
			} );
	}

	latestPostTitle() {
		return this.driver.findElement( by.css( '.reader-post-card__title' ) ).getText();
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

	waitForModeratedCommentToAppear() {
		return driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			by.css( '.comments__comment-moderation' )
		);
	}
}
