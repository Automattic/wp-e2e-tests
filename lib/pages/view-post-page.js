import { By, until } from 'selenium-webdriver';

import BaseContainer from '../base-container.js';

import * as driverHelper from '../driver-helper.js';

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
		return this.driver.findElement( By.css( `img[alt='${ fileDetails.fileName }']` ) ).then( ( imageElement ) => {
			return driverHelper.imageVisible( this.driver, imageElement );
		} );
	}

	leaveAComment( comment ) {
		driverHelper.setWhenSettable( this.driver, By.css( '#comment' ), comment );
		return driverHelper.clickWhenClickable( this.driver, By.css( '#comment-submit' ) );
	}

	commentEventuallyShown( comment ) {
		return this.driver.wait( until.elementLocated( By.xpath( `//p[text() = "${comment}"]` ) ), this.explicitWaitMS ).then( () => {
			return true;
		}, ( error ) => {
			console.log( `Error thrown waiting for comment: ${ error }` );
			return false;
		} );
	}
}
