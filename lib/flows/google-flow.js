/** @format */

import * as driverManager from '../driver-manager.js';

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

	search( params ) {
		var screenSize = this.screenSize;
		this.GoogleAdPreviewTool = new GoogleAdPreviewTool(
			this.driver,
			screenSize,
			params.domain,
			params.location,
			params.query
		);

		this.driver.takeScreenshot();

		return this.GoogleAdPreviewTool.getSearchPageUrl();
	}
}
