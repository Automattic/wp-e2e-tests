import { By } from 'selenium-webdriver';

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
		return this.driver.findElement( By.css( 'span.cat-links a[rel="category tag"],.post-categories a[rel="category tag"],.categories-links a[rel="category tag"]' ) ).getText();
	};

	tagDisplayed() {
		return this.driver.findElement( By.css( '.tags-links a[rel=tag],.tag-links a[rel=tag],.post-tags a[rel=tag]' ) ).getText();
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
}
