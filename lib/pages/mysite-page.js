// This is the page shown after clicking on the site name from side bar

import { By as by, until } from 'selenium-webdriver';
import config from 'config';

import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

export default class MySitePage extends BaseContainer {
	constructor( driver, visit = false ) {
		let url = config.get( 'calypsoBaseURL' );
		if ( config.has( 'liveBranch' ) && config.get( 'liveBranch' ) === 'true' ) {
			url = url + '?branch=' + config.get( 'branchName' );
		}
		super( driver, by.css( '.web-preview__frame' ), visit, url );
	}
	isWebPreviewPresent() {
		return driverHelper.isElementPresent( this.driver, by.css( '.web-preview__external' ) );
	}
	isSeoPresent() {
		return driverHelper.isElementPresent( this.driver, by.css( '.web-preview__seo-label' ) );
	}
	isSitePresent() {
		return driverHelper.isElementPresent( this.driver, by.css( '.web-preview__frame' ) );
	}
	closeSite() {
		driverHelper.clickWhenClickable( this.driver, by.css( '.web-preview__close' ) );
	}
}
