/** @format */

import { By, until } from 'selenium-webdriver';
import config from 'config';

import BaseContainer from '../base-container.js';

import ViewPostPage from '../../lib/pages/view-post-page.js';
import * as driverHelper from '../driver-helper.js';

export default class PostPreviewComponent extends BaseContainer {
	constructor( driver ) {
		PostPreviewComponent.switchToIFrame( driver );
		super( driver, By.css( '#main' ) );
		driver.switchTo().defaultContent();
	}

	postTitle() {
		PostPreviewComponent.switchToIFrame( this.driver );
		this.viewPostPage = new ViewPostPage( this.driver );
		return this.viewPostPage.postTitle();
	}

	postContent() {
		PostPreviewComponent.switchToIFrame( this.driver );
		this.viewPostPage = new ViewPostPage( this.driver );
		return this.viewPostPage.postContent();
	}

	categoryDisplayed() {
		PostPreviewComponent.switchToIFrame( this.driver );
		this.viewPostPage = new ViewPostPage( this.driver );
		return this.viewPostPage.categoryDisplayed();
	}

	tagDisplayed() {
		PostPreviewComponent.switchToIFrame( this.driver );
		this.viewPostPage = new ViewPostPage( this.driver );
		return this.viewPostPage.tagDisplayed();
	}

	imageDisplayed( fileDetails ) {
		PostPreviewComponent.switchToIFrame( this.driver );
		this.viewPostPage = new ViewPostPage( this.driver );
		return this.viewPostPage.imageDisplayed( fileDetails );
	}

	async edit() {
		this.driver.switchTo().defaultContent();
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.button.web-preview__edit' )
		);
	}

	close() {
		this.driver.switchTo().defaultContent();
		return driverHelper.clickWhenClickable( this.driver, By.css( 'button.web-preview__close' ) );
	}

	static async switchToIFrame( driver ) {
		const iFrameSelector = By.css( '.web-preview__frame' );
		const explicitWaitMS = config.get( 'explicitWaitMS' );
		driver.switchTo().defaultContent();
		await driverHelper.waitTillPresentAndDisplayed(
			driver,
			By.css( '.web-preview__inner.is-visible.is-loaded' )
		);
		return await driver.wait(
			until.ableToSwitchToFrame( iFrameSelector ),
			explicitWaitMS,
			'Could not switch to web preview iFrame'
		);
	}
}
