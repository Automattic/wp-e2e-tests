/** @format */

import { By } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper.js';

import AsyncBaseContainer from '../async-base-container';

export default class ImportPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.importer__shell' ) );
	}

	async previewSiteToBeImported() {
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.site-importer__site-preview' )
		);

		return await driverHelper.imageVisible( this.driver, By.css( '.mini-site-preview__favicon' ) );
	}

	async siteImporterInputPane() {
		return await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.site-importer__site-importer-pane' )
		);
	}

	async siteImporterCanStartImport() {
		return await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			// @TODO use a specific classname for this button
			By.css( '.site-importer__site-importer-confirm-actions .button.is-primary' )
		);
	}
}
