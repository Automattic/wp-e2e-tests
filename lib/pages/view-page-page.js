import { By } from 'selenium-webdriver';

import BaseContainer from '../base-container.js';

import * as driverHelper from '../driver-helper.js';

export default class ViewPagePage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.type-page' ) );
	}

	pageTitle() {
		return this.driver.findElement( By.css( '.entry-title,.post-title' ) ).getText();
	};

	pageContent() {
		return this.driver.findElement( By.css( '.entry-content,.post-content' ) ).getText();
	};

	sharingButtonsVisible() {
		return this.driver.isElementPresent( By.css( 'div.sd-sharing' ) );
	};

	isPasswordProtected() {
		return this.driver.isElementPresent( By.css( 'form.post-password-form' ) );
	};

	categoryDisplayed() {
		return this.driver.findElement( By.css( 'span.cat-links a[rel="category tag"],.post-categories a[rel="category tag"]' ) ).getText();
	};

	tagDisplayed() {
		return this.driver.findElement( By.css( '.tag-links a[rel=tag],.tags-links a[rel=tag],.post-tags a[rel=tag]' ) ).getText();
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
}
