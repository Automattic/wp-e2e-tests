/** @format */

import { By } from 'selenium-webdriver';
import AsyncBaseContainer from '../async-base-container';

import * as driverHelper from '../driver-helper';

export default class MediaPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.media-library__content' ) );
	}

	async selectRandomMedia() {
		await this.driver.sleep( 3000 ); // TODO: try and remove this sleep
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.media-library__list-item' )
		);
		await driverHelper.clickWhenClickable( this.driver, By.css( '.media-library__list-item' ) );
	}

	async selectEditMedia() {
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( 'button[data-e2e-button="edit"]' )
		);
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'button[data-e2e-button="edit"]' )
		);
	}

	async mediaEditorShowing() {
		await driverHelper.waitTillPresentAndDisplayed( this.driver, By.css( '.editor-media-modal' ) );
		return await driverHelper.isElementPresent( this.driver, By.css( '.editor-media-modal' ) );
	}

	async imageShowingInEditor() {
		return await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.image-editor__crop' )
		);
	}

	async clickEditImage() {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.editor-media-modal-detail__preview-wrapper .editor-media-modal-detail__edit' )
		);
	}
}
