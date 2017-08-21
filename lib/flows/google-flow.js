import webdriver from 'selenium-webdriver';
import fs from 'fs-extra';
import config from 'config';

import * as mediaHelper from '../media-helper.js';
import * as driverManager from '../driver-manager.js';
import * as dataHelper from '../data-helper.js';

import GoogleAdPreviewTool from '../pages/external/google-ad-preview-tool.js';
import GoogleSearchPage from '../pages/external/google-search.js';

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
		var d = webdriver.promise.defer();
		var driver = this.driver;
		var screenSize = this.screenSize;
		this.GoogleAdPreviewTool = new GoogleAdPreviewTool( driver, data.language, params.originating_location );

		driver.takeScreenshot().then( function( data ) {
			// mediaHelper.writeScreenshot( data, data.language.toUpperCase() + '_' + screenSize + 'GOOGLE', true );
		} );

		this.GoogleAdPreviewTool.search( params.query );
		var searchUrl = this.GoogleAdPreviewTool.getSearchPageUrl();
		d.fulfill( new GoogleSearchPage( driver, 'https://' + data.wpcom_base_url ) );
		return d.promise;
	}
}
