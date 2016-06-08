import webdriver from 'selenium-webdriver';
import config from 'config';

import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

const by = webdriver.By;
const until = webdriver.until;

export default class ReaderPage extends BaseContainer {
	constructor( driver, visit = false ) {
		const url = config.get( 'calypsoBaseURL' );
		super( driver, by.css( '.is-section-reader' ), visit, url );
	}
	siteOfLatestPost() {
		return this.driver.findElement( by.css( 'article.reader__card .site__domain' ) ).getText();
	}
	likeLatestPost() {
		return driverHelper.clickWhenClickable( this.driver, by.css( 'article.reader__card .like-button' ) );
	}
	latestPostIsLiked() {
		return this.driver.findElement( by.css( 'article.reader__card .like-button' ) ).getAttribute( 'class' ).then( ( classNames ) => {
			return classNames.includes( 'is-liked' );
		} );
	}
	latestPostTitle() {
		return this.driver.findElement( by.css( 'article.reader__card .reader__post-title' ) ).getText();
	}
	commentOnLatestPost( comment ) {
		driverHelper.clickWhenClickable( this.driver, by.css( '.comment-button' ) );
		driverHelper.setWhenSettable( this.driver, by.css( '.comments__form textarea' ), comment );
		driverHelper.clickWhenClickable( this.driver, by.css( '.comments__form button' ) );
		return this.driver.wait( until.elementLocated( by.css( '.comment__moderation' ) ), this.explicitWaitMS, 'Could not see the comment moderation message after submitting a new comment' );
	}
}
