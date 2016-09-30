import { By as by, until } from 'selenium-webdriver';
import config from 'config';

import BaseContainer from '../base-container.js';

import ViewPagePage from '../../lib/pages/view-page-page.js';
import * as driverHelper from '../driver-helper.js';

export default class PagePreviewComponent extends BaseContainer {
	constructor( driver ) {
		PagePreviewComponent.switchToIFrame( driver );
		super( driver, by.css( '#main' ) );
		driver.switchTo().defaultContent();
	}

	pageTitle() {
		PagePreviewComponent.switchToIFrame( this.driver );
		this.viewPagePage = new ViewPagePage( this.driver );
		return this.viewPagePage.pageTitle();
	}

	pageContent() {
		PagePreviewComponent.switchToIFrame( this.driver );
		this.viewPagePage = new ViewPagePage( this.driver );
		return this.viewPagePage.pageContent();
	}

	imageDisplayed( fileDetails ) {
		PagePreviewComponent.switchToIFrame( this.driver );
		this.viewPagePage = new ViewPagePage( this.driver );
		return this.viewPagePage.imageDisplayed( fileDetails );
	}

	close() {
		this.driver.switchTo().defaultContent();
		return driverHelper.clickWhenClickable( this.driver, by.css( 'button.web-preview__close' ) );
	}

	static switchToIFrame( driver ) {
		const iFrameSelector = by.css( '.web-preview__frame' );
		const explicitWaitMS = config.get( 'explicitWaitMS' );
		driver.switchTo().defaultContent();
		driverHelper.waitTillPresentAndDisplayed( driver, by.css( '.web-preview.is-visible.is-loaded' ) );
		return driver.wait( until.ableToSwitchToFrame( iFrameSelector ), explicitWaitMS, 'Could not switch to web preview iFrame' );
	}
}
