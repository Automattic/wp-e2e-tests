import webdriver from 'selenium-webdriver';
import fs from 'fs-extra';
import config from 'config';

import * as mediaHelper from '../media-helper.js';
import * as driverManager from '../driver-manager.js';
import * as dataHelper from '../data-helper.js';

import GoogleAdPreviewTool from '../pages/external/google-ad-preview-tool.js';

export default class GoogleFlow {
	constructor( driver, screenSize ) {
		this.driver = driver;

		if ( screenSize === undefined ) {
			this.screenSize = driverManager.currentScreenSize();
		} else {
			driverManager.resizeBrowser( driver, screenSize );
			this.screenSize = screenSize;
		}
	}

	search( params, data ) {
		var screenSize = this.screenSize;
		this.GoogleAdPreviewTool = new GoogleAdPreviewTool( this.driver, screenSize, params.domain, params.location, params.query );

		this.driver.takeScreenshot().then( function( data ) {
			// mediaHelper.writeScreenshot( data, data.language.toUpperCase() + '_' + screenSize + 'GOOGLE', true );
		} );

		return this.GoogleAdPreviewTool.getSearchPageUrl();
	}
}
