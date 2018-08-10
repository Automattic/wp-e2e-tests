/** @format */

import { By, until } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper';
import * as dataHelper from '../../data-helper';

import AsyncBaseContainer from '../../async-base-container';

export default class CommentsAreaComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '#comments.comments-area' ) );
	}

	async _postComment( { comment } ) {
		const commentForm = By.css( '#commentform' );
		const commentFormWordPress = By.css( '#comment-form-wordpress' );
		const commentField = By.css( '#comment' );
		const submitButton = By.css( '.form-submit #comment-submit' );
		const commentContent = By.xpath( `//div[@class='comment-content']/p[.='${ comment }']` );

		await this.switchToFrameIfJetpack();

		// await driverHelper.waitTillPresentAndDisplayed( this.driver, By.css( '#hc_post_as' ) );
		// const isLoggedIn = await this.driver.findElement( By.css( '#hc_post_as' ) ).getAttribute( 'value' ) !== 'guest';

		await driverHelper.clickWhenClickable( this.driver, commentForm );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, commentFormWordPress );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, submitButton );
		await driverHelper.setWhenSettable( this.driver, commentField, comment );

		// Not needed when logged in:
		// await driverHelper.setWhenSettable( this.driver, By.css( '#author' ), name );
		// await driverHelper.setWhenSettable( this.driver, By.css( '#email' ), email );
		// if ( site ) {
		// 	await driverHelper.setWhenSettable( this.driver, By.css( '#site' ), site );
		// }

		// await this.driver.sleep( 1000 );
		await driverHelper.scrollIntoView( this.driver, submitButton );
		await driverHelper.clickWhenClickable( this.driver, submitButton );
		await this.switchToFrameIfJetpack();
		return await driverHelper.waitTillPresentAndDisplayed( this.driver, commentContent );
	}

	async reply( commentObj, depth = 2 ) {
		const replyButton = By.css( '.comment-reply-link' );
		const replyContent = By.xpath(
			`//li[contains(@class,'depth-${ depth }')]//div[@class='comment-content']/p[.='${
				commentObj.comment
			}']`
		);
		// await this.driver.sleep( 1000 );
		// await driverHelper.waitTillPresentAndDisplayed( this.driver, replyButton );
		await driverHelper.clickWhenClickable( this.driver, replyButton );
		// await this.driver.sleep( 1000 );

		await this._postComment( commentObj );
		return await driverHelper.waitTillPresentAndDisplayed( this.driver, replyContent );
	}

	async switchToFrameIfJetpack() {
		if ( dataHelper.getJetpackHost() === 'WPCOM' ) {
			return false;
		}
		const iFrameSelector = By.css( 'iframe.jetpack_remote_comment' );
		await this.driver.sleep( 1000 ); // To make sure that iFrame already there

		await this.driver.switchTo().defaultContent();
		await driverHelper.waitTillPresentAndDisplayed( this.driver, iFrameSelector );
		await this.driver.wait(
			until.ableToSwitchToFrame( iFrameSelector ),
			this.explicitWaitMS,
			'Could not switch to comment form iFrame'
		);
	}
}
