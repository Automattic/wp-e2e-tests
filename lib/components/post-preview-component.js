/** @format */

import { By, until } from 'selenium-webdriver';
import config from 'config';

import AsyncBaseContainer from '../async-base-container';

import ViewPostPage from '../../lib/pages/view-post-page.js';
import * as driverHelper from '../driver-helper.js';

export default class PostPreviewComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '#main' ) );
	}

	async _postInit() {
		await this.switchToIFrame( this.driver );
		return await this.driver.switchTo().defaultContent();
	}

	async postTitle() {
		await this.switchToIFrame( this.driver );
		this.viewPostPage = await ViewPostPage.Expect( this.driver );
		return await this.viewPostPage.postTitle();
	}

	async postContent() {
		await this.switchToIFrame( this.driver );
		this.viewPostPage = await ViewPostPage.Expect( this.driver );
		return await this.viewPostPage.postContent();
	}

	async categoryDisplayed() {
		await this.switchToIFrame( this.driver );
		this.viewPostPage = await ViewPostPage.Expect( this.driver );
		return await this.viewPostPage.categoryDisplayed();
	}

	async tagDisplayed() {
		await this.switchToIFrame( this.driver );
		const viewPostPage = await ViewPostPage.Expect( this.driver );
		return await viewPostPage.tagDisplayed();
	}

	async imageDisplayed( fileDetails ) {
		await this.switchToIFrame( this.driver );
		this.viewPostPage = await ViewPostPage.Expect( this.driver );
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

	async switchToIFrame( driver ) {
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
