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

	async postTitle() {
		await PostPreviewComponent.switchToIFrame( this.driver );
		this.viewPostPage = new ViewPostPage( this.driver );
		return await this.viewPostPage.postTitle();
	}

	async postContent() {
		await PostPreviewComponent.switchToIFrame( this.driver );
		this.viewPostPage = new ViewPostPage( this.driver );
		return await this.viewPostPage.postContent();
	}

	async categoryDisplayed() {
		await PostPreviewComponent.switchToIFrame( this.driver );
		this.viewPostPage = new ViewPostPage( this.driver );
		return await this.viewPostPage.categoryDisplayed();
	}

	async tagDisplayed() {
		await PostPreviewComponent.switchToIFrame( this.driver );
		return await new ViewPostPage( this.driver ).tagDisplayed();
	}

	async imageDisplayed( fileDetails ) {
		await PostPreviewComponent.switchToIFrame( this.driver );
		this.viewPostPage = new ViewPostPage( this.driver );
		return await this.viewPostPage.imageDisplayed( fileDetails );
	}

	async edit() {
		this.driver.switchTo().defaultContent();
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.button.web-preview__edit' )
		);
	}

	async close() {
		await this.driver.switchTo().defaultContent();
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'button.web-preview__close' )
		);
	}

	static async switchToIFrame( driver ) {
		const iFrameSelector = By.css( '.web-preview__frame' );
		const explicitWaitMS = config.get( 'explicitWaitMS' );
		await driver.switchTo().defaultContent();
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
