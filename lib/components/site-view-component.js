// This is the site view shown after clicking on the site name from side bar

import { By as by, until } from 'selenium-webdriver';
import config from 'config';

import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

export default class SiteViewComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.main .web-preview__frame' ) );
	}
	isWebPreviewPresent() {
		this.driver.switchTo().defaultContent();
		return driverHelper.isElementPresent( this.driver, by.css( '.main .web-preview__external' ) );
	}
	isOpenInNewWindowButtonPresent() {
		this.driver.switchTo().defaultContent();
		return driverHelper.isElementPresent( this.driver, by.css( '.main .web-preview__toolbar .web-preview__external' ) );
	}
	isSitePresent() {
		SiteViewComponent.switchToIFrame( this.driver );
		return driverHelper.isElementPresent( this.driver, by.css( 'body.home' ) );
	}
	selectSearchAndSocialPreview() {
		this.driver.switchTo().defaultContent();
		driverHelper.clickWhenClickable( this.driver, by.css( '.main .web-preview__device-switcher' ) );
		return driverHelper.clickWhenClickable( this.driver, by.css( 'a[data-bold-text="Search & Social"]' ) );
	}
	close() {
		this.driver.switchTo().defaultContent();
		return driverHelper.clickWhenClickable( this.driver, by.css( '.web-preview__close' ) );
	}
	static switchToIFrame( driver ) {
		const iFrameSelector = by.css( '.web-preview__frame' );
		const explicitWaitMS = config.get( 'explicitWaitMS' );
		driver.switchTo().defaultContent();
		driverHelper.waitTillPresentAndDisplayed( driver, by.css( '.web-preview__inner.is-loaded' ) );
		return driver.wait( until.ableToSwitchToFrame( iFrameSelector ), explicitWaitMS, 'Could not switch to web preview iFrame' );
	}

}
