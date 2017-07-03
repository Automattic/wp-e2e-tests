import { By as by } from 'selenium-webdriver';
import config from 'config';
import URL from 'url';

import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

export default class ReaderPage extends BaseContainer {
	constructor( driver, visit = false ) {
		let url = config.get( 'calypsoBaseURL' ) + '/read';
		if ( config.has( 'liveBranch' ) && config.get( 'liveBranch' ) === 'true' ) {
			url = url + '?branch=' + config.get( 'branchName' );
		}
		super( driver, by.css( '.is-section-reader' ), visit, url );
	}

	siteOfLatestPost() {
		return this.driver.findElement( by.css( '.reader-visit-link' ) ).getAttribute( 'href' ).then( ( href ) => {
			return URL.parse( href ).host;
		} );
	}

	likeLatestPost() {
		return driverHelper.clickWhenClickable( this.driver, by.css( '.reader-post-card .like-button' ) );
	}

	latestPostIsLiked() {
		return this.driver.findElement( by.css( '.reader-post-card .like-button' ) ).getAttribute( 'class' ).then( ( classNames ) => {
			return classNames.includes( 'is-liked' );
		} );
	}

	latestPostTitle() {
		return this.driver.findElement( by.css( '.reader-post-card__title' ) ).getText();
	}

	commentOnLatestPost( comment ) {
		driverHelper.clickWhenClickable( this.driver, by.css( '.comment-button' ) );
		driverHelper.setWhenSettable( this.driver, by.css( '.comments__form textarea' ), comment );
		return driverHelper.clickWhenClickable( this.driver, by.css( '.comments__form button' ) );
	}

	waitForModeratedCommentToAppear() {
		return driverHelper.waitTillPresentAndDisplayed( this.driver, by.css( '.comments__comment-moderation' ) );
	}
}
