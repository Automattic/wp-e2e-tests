/** @format */
import { By } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper';
import AsyncBaseContainer from '../async-base-container';
import webdriver from 'selenium-webdriver';
import * as driverManager from '../driver-manager';

export default class GutenbergEditorComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '#editor.gutenberg__editor .edit-post-header' ) );
	}

	async publish( { visit = false } = {} ) {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.editor-post-publish-panel__toggle' )
		);
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.editor-post-publish-panel__header' )
		);
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.editor-post-publish-panel__header-publish-button button:not([disabled])' )
		);
		await driverHelper.waitTillNotPresent(
			this.driver,
			By.css( '.editor-post-publish-panel__content .components-spinner' )
		);
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.editor-post-publish-panel__header-published' )
		);
		const url = await this.driver
			.findElement( By.css( '.post-publish-panel__postpublish-header a' ) )
			.getAttribute( 'href' );

		if ( visit ) {
			await driverHelper.clickWhenClickable(
				this.driver,
				By.css( '.post-publish-panel__postpublish-buttons a' )
			);
		}

		return url;
	}

	async enterTitle( title ) {
		return await driverHelper.setWhenSettable( this.driver, By.css( '#post-title-0' ), title );
	}

	async enterText( text ) {
		const appenderSelector = By.css( '.editor-default-block-appender' );
		const textSelector = By.css( '.wp-block-paragraph' );
		await driverHelper.clickWhenClickable( this.driver, appenderSelector );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, textSelector );
		return await this.driver.findElement( textSelector ).sendKeys( text );
	}

	/*
		name - name for file to set as alt text
		path - local path to file
	 */
	async sendFile( name, path ) {
		const fileNameInputSelector = webdriver.By.css(
			'.components-form-file-upload input[type="file"]'
		);
		const driver = this.driver;

		await driverHelper.waitTillPresentAndDisplayed(
			driver,
			By.css( '.components-form-file-upload ' )
		);
		let filePathInput = await driver.findElement( fileNameInputSelector );
		await filePathInput.sendKeys( path );

		await driverHelper.clickWhenClickable(
			driver,
			By.css( '.components-textarea-control__input' )
		);
		let altTextInput = await driver.findElement( By.css( '.components-textarea-control__input' ) );
		altTextInput.sendKeys( name );
	}

	async enterImage( fileDetails ) {
		const newImageName = fileDetails.imageName;
		const newFile = fileDetails.file;

		await this.sendFile( newImageName, newFile );
	}

	async errorDisplayed() {
		await this.driver.sleep( 1000 );
		return await driverHelper.isElementPresent( this.driver, By.css( '.editor-error-boundary' ) );
	}

	async removeNUXNotice() {
		const nuxDismissButtonSelector = By.css( '.nux-dot-tip button.nux-dot-tip__disable' );
		const isVisible = await driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			nuxDismissButtonSelector
		);
		if ( ! isVisible ) {
			return isVisible;
		}
		await driverHelper.clickWhenClickable( this.driver, nuxDismissButtonSelector );
		return await driverHelper.waitTillNotPresent( this.driver, nuxDismissButtonSelector );
	}

	// return blockID - top level block id which is looks like `block-b91ce479-fb2d-45b7-ad92-22ae7a58cf04`. Should be used for further interaction with added block.
	async addBlock( name ) {
		name = name.charAt( 0 ).toUpperCase() + name.slice( 1 ); // Capitalize block name
		const inserterToggleSelector = By.css( '.edit-post-header .editor-inserter__toggle' );
		const inserterMenuSelector = By.css( '.editor-inserter__menu' );
		const inserterSearchInputSelector = By.css( 'input.editor-inserter__search' );
		const inserterBlockItemSelector = By.css(
			`li.editor-block-types-list__list-item button[aria-label='${ name }']`
		);
		const insertedBlockSelector = By.css(
			`.editor-block-list__block.is-selected[aria-label*='${ name }']`
		);

		await driverHelper.waitTillPresentAndDisplayed( this.driver, inserterToggleSelector );
		await driverHelper.clickWhenClickable( this.driver, inserterToggleSelector );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, inserterMenuSelector );
		await driverHelper.setWhenSettable( this.driver, inserterSearchInputSelector, name );
		await driverHelper.clickWhenClickable( this.driver, inserterBlockItemSelector );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, insertedBlockSelector );
		return await this.driver.findElement( insertedBlockSelector ).getAttribute( 'id' );
	}

	async ensureSaved() {
		driverHelper.clickIfPresent( this.driver, By.css( 'editor-post-save-draft' ) );
		const savedSelector = By.css( 'span.is-saved' );

		return await driverHelper.waitTillPresentAndDisplayed( this.driver, savedSelector );
	}

	async launchPreview() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.editor-post-preview' ),
			this.explicitWaitMS
		);
	}
}
