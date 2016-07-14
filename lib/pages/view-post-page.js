import { By, until } from 'selenium-webdriver';

import BaseContainer from '../base-container';

import * as driverHelper from '../driver-helper';
import * as slackNotifier from '../slack-notifier';

export default class ViewPostPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.type-post' ) );
	}

	postTitle() {
		return this.driver.findElement( By.css( '.entry-title,.post-title' ) ).getText();
	};

	commentsVisible() {
		return this.driver.isElementPresent( By.css( '#respond' ) );
	};

	sharingButtonsVisible() {
		return this.driver.isElementPresent( By.css( 'div.sd-sharing' ) );
	};

	postContent() {
		return this.driver.findElement( By.css( '.entry-content,.post-content' ) ).getText();
	};

	categoryDisplayed() {
		return this.driver.findElement( By.css( 'a[rel="category tag"]' ) ).getText();
	};

	tagDisplayed() {
		return this.driver.findElement( By.css( 'a[rel=tag]' ) ).getText();
	};

	isPasswordProtected() {
		return this.driver.isElementPresent( By.css( 'form.post-password-form' ) );
	};

	enterPassword( password ) {
		this.driver.findElement( By.css( 'form.post-password-form input[name=post_password]' ) ).sendKeys( password );
		driverHelper.clickWhenClickable( this.driver, By.css( 'form.post-password-form input[name=Submit]' ), this.explicitWaitMS );
	};

	imageDisplayed( fileDetails ) {
		return this.driver.findElement( By.css( `img[alt='${ fileDetails.imageName }']` ) ).then( ( imageElement ) => {
			return driverHelper.imageVisible( this.driver, imageElement );
		} );
	}

	leaveAComment( comment ) {
		const self = this;
		const commentButtonSelector = By.css( '#comment-submit' );
		const commentSubmittingSelector = By.css( '#comment-form-submitting' );
		driverHelper.setWhenSettable( self.driver, By.css( '#comment' ), comment );
		driverHelper.clickWhenClickable( self.driver, commentButtonSelector );
		return self.driver.wait( function() {
			return self.driver.isElementPresent( commentSubmittingSelector ).then( function( present ) {
				return !present;
			} );
		}, self.explicitWaitMS, 'The comment form was still submitting after waiting for it to submit' );
	}

	commentEventuallyShown( comment ) {
		const self = this;
		const commentSelector = By.xpath( `//p[text() = "${comment}"]` );
		return self.driver.wait( until.elementLocated( commentSelector ), this.explicitWaitMS ).then( ( ) => {
			return true;
		}, ( ) => {
			return false;
		} );
	}
}
