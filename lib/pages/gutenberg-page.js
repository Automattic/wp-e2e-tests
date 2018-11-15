/** @format */

import webdriver from 'selenium-webdriver';

import * as driverHelper from '../driver-helper.js';
import * as dataHelper from '../data-helper';

const by = webdriver.By;

import AsyncBaseContainer from '../async-base-container';

export default class GutenbergPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		if ( ! url ) {
			url = GutenbergPage._getUrl();
		}
		super( driver, by.css( '.is-section-gutenberg-editor' ), url );
		this.editorFrameName = by.css( '.edit-post-layout' );
	}

	async _postInit() {
		const contentSelector = by.css( 'div.is-section-gutenberg-editor' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, contentSelector );
		await this.waitForPage();
		return await driverHelper.waitTillPresentAndDisplayed( this.driver, this.editorFrameName );
	}

	static _getUrl() {
		return dataHelper.getCalypsoURL( 'gutenberg/post' );
	}
}
