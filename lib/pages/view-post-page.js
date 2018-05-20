/** @format */

import { By, until } from 'selenium-webdriver';

import BaseContainer from '../base-container';

import * as driverHelper from '../driver-helper';

export default class ViewPostPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.type-post' ) );
	}

	async postTitle() {
		return await this.driver.findElement( By.css( '.entry-title,.post-title' ) ).getText();
	}

	async commentsVisible() {
		return await driverHelper.isElementPresent( this.driver, By.css( '#respond' ) );
	}

	async sharingButtonsVisible() {
		return await driverHelper.isElementPresent( this.driver, By.css( 'div.sd-sharing' ) );
	}

	async postContent() {
		return await this.driver.findElement( By.css( '.entry-content,.post-content' ) ).getText();
	}

	async categoryDisplayed() {
		return await this.driver
			.findElement( By.css( 'a[rel="category tag"], a[rel="category"]' ) )
			.getText();
	}

	async tagDisplayed() {
		return await this.driver.findElement( By.css( 'a[rel=tag]' ) ).getText();
	}

	async contactFormDisplayed() {
		return await driverHelper.isElementPresent( this.driver, By.css( '.contact-form' ) );
	}

	async paymentButtonDisplayed() {
		return await driverHelper.isElementPresent(
			this.driver,
			By.css( '.jetpack-simple-payments-wrapper' )
		);
	}

	async isPasswordProtected() {
		return await driverHelper.isElementPresent( this.driver, By.css( 'form.post-password-form' ) );
	}

	async enterPassword( password ) {
		let element = await this.driver.findElement(
			By.css( 'form.post-password-form input[name=post_password]' )
		);
		await element.sendKeys( password );
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'form.post-password-form input[name=Submit]' ),
			this.explicitWaitMS
		);
	}

	async imageDisplayed( fileDetails ) {
		return await this.driver
			.findElement( By.css( `img[alt='${ fileDetails.imageName }']` ) )
			.then( imageElement => {
				return driverHelper.imageVisible( this.driver, imageElement );
			} );
	}

	async leaveAComment( comment ) {
		const self = this;
		const commentButtonSelector = By.css( '#comment-submit' );
		const commentSubmittingSelector = By.css( '#comment-form-submitting' );
		await driverHelper.setWhenSettable( self.driver, By.css( '#comment' ), comment );
		await driverHelper.clickWhenClickable( self.driver, commentButtonSelector );
		return await self.driver.wait(
			function() {
				return driverHelper
					.isElementPresent( self.driver, commentSubmittingSelector )
					.then( function( present ) {
						return ! present;
					} );
			},
			self.explicitWaitMS,
			'The comment form was still submitting after waiting for it to submit'
		);
	}

	async commentEventuallyShown( comment ) {
		const self = this;
		const commentSelector = By.xpath( `//p[text() = "${ comment }"]` );
		return self.driver.wait( until.elementLocated( commentSelector ), this.explicitWaitMS ).then(
			() => {
				return true;
			},
			() => {
				return false;
			}
		);
	}

	relatedPostsLargeShown() {
		const selector = By.css( '.jp-relatedposts-items-visual' );
		return driverHelper.isEventuallyPresentAndDisplayed( this.driver, selector );
	}

	relatedPostsHeaderShown() {
		const selector = By.css( '.jp-relatedposts-headline' );
		return driverHelper.isEventuallyPresentAndDisplayed( this.driver, selector );
	}

	relatedPostsShown() {
		const selector = By.css( '.jp-relatedposts-post' );
		return this.driver.findElements( selector );
	}

	likePost() {
		const likeSelector = By.css( 'a.like' );
		const likedSelector = By.css( 'a.liked' );
		const iFrameSelector = By.css( 'iframe.post-likes-widget' );
		this.driver.wait(
			until.ableToSwitchToFrame( iFrameSelector ),
			this.explicitWaitMS,
			'Can not switch to the likes iFrame on the view post page'
		);
		driverHelper.clickWhenClickable( this.driver, likeSelector );
		driverHelper.waitTillPresentAndDisplayed( this.driver, likedSelector );
		return this.driver.switchTo().defaultContent();
	}

	postImageUsingPhoton() {
		const imageSelector = By.css( '.entry-content p img' );
		return this.driver
			.findElement( imageSelector )
			.getAttribute( 'src' )
			.then( src => {
				return src.indexOf( '.wp.com' ) > -1;
			} );
	}
}
