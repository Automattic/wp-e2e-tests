/** @format */
import { By } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper';
import * as driverManager from '../driver-manager.js';
import AsyncBaseContainer from '../async-base-container';

export default class GutenbergEditorComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '#editor.gutenberg__editor .edit-post-header' ) );
	}

	async _postInit() {
		await this.removeNUXNotice();
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
			By.css( '.editor-post-publish-panel__header-publish-button button[aria-disabled=false]' )
		);
		await driverHelper.waitTillNotPresent(
			this.driver,
			By.css( '.editor-post-publish-panel__content .components-spinner' )
		);
		this.waitForSuccessViewPostNotice();
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

	async update( { visit = false } = {} ) {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'button.editor-post-publish-button' )
		);

		if ( visit ) {
			return await driverHelper.clickWhenClickable(
				this.driver,
				By.css( '.components-notice.is-success a' )
			);
		}
	}

	async enterTitle( title ) {
		const titleFieldSelector = By.css( '#post-title-0' );
		await driverHelper.clearTextArea( this.driver, titleFieldSelector );
		return await this.driver.findElement( titleFieldSelector ).sendKeys( title );
	}

	async enterText( text ) {
		const appenderSelector = By.css( '.editor-default-block-appender' );
		const textSelector = By.css( '.wp-block-paragraph' );
		await driverHelper.clickWhenClickable( this.driver, appenderSelector );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, textSelector );
		return await this.driver.findElement( textSelector ).sendKeys( text );
	}

	async insertContactForm() {
		await this.addBlock( 'Shortcode' );
		const shortcodeSelector = By.css( 'textarea.editor-plain-text' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, shortcodeSelector );
		const shortcodeTextarea = await this.driver.findElement( shortcodeSelector );
		return await shortcodeTextarea.sendKeys( '[contact-form][/contact-form]' );
	}

	async errorDisplayed() {
		await this.driver.sleep( 1000 );
		return await driverHelper.isElementPresent( this.driver, By.css( '.editor-error-boundary' ) );
	}

	async removeNUXNotice() {
		const nuxPopupSelector = By.css( '.nux-dot-tip' );
		if ( await driverHelper.isElementPresent( this.driver, nuxPopupSelector ) ) {
			const element = await this.driver.findElement( nuxPopupSelector );
			await this.driver.executeScript( "return arguments[0].style.visibility='hidden';", element );
		}
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

	async titleShown() {
		let titleSelector = By.css( '#post-title-0' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, titleSelector );
		const element = await this.driver.findElement( titleSelector );
		return await element.getAttribute( 'value' );
	}

	async uploadImage( fileDetails ) {
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.components-form-file-upload ' )
		);
		const filePathInput = await this.driver.findElement(
			By.css( '.components-form-file-upload input[type="file"]' )
		);
		await filePathInput.sendKeys( fileDetails.file );
		return await driverHelper.waitTillNotPresent(
			this.driver,
			By.css( '.wp-block-image .components-spinner' )
		); // Wait for upload spinner to complete
	}

	async toggleSidebar( open = true ) {
		const sidebarSelector = '.edit-post-sidebar-header';
		const sidebarOpen = await driverHelper.isElementPresent(
			this.driver,
			By.css( sidebarSelector )
		);
		if ( open && ! sidebarOpen ) {
			return await driverHelper.clickWhenClickable(
				this.driver,
				By.css( "button[aria-label='Settings']" )
			);
		}

		if ( ! open && sidebarOpen ) {
			if ( driverManager.currentScreenSize() === 'desktop' ) {
				return await driverHelper.clickWhenClickable(
					this.driver,
					By.css( ".edit-post-sidebar__panel-tabs button[aria-label='Close settings']" )
				);
			}
			return await driverHelper.clickWhenClickable(
				this.driver,
				By.css( ".edit-post-sidebar-header__small button[aria-label='Close settings']" )
			);
		}
	}

	async openSidebar() {
		return await this.toggleSidebar( true );
	}

	async closeSidebar() {
		return await this.toggleSidebar( false );
	}

	async closePublishedPanel() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.editor-post-publish-panel__header button.components-button.components-icon-button' )
		);
	}

	async ensureSaved() {
		await driverHelper.clickWhenClickable( this.driver, By.css( '.editor-post-save-draft' ) );
		const savedSelector = By.css( 'span.is-saved' );

		return await driverHelper.waitTillPresentAndDisplayed( this.driver, savedSelector );
	}

	async waitForSuccessViewPostNotice() {
		return await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.components-notice.is-success' )
		);
	}

	async launchPreview() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.editor-post-preview' ),
			this.explicitWaitMS
		);
	}

	async revertToDraft() {
		let revertDraftSelector = By.css( 'button.editor-post-switch-to-draft' );
		await driverHelper.clickWhenClickable( this.driver, revertDraftSelector );
		const revertAlert = await this.driver.switchTo().alert();
		return await revertAlert.accept();
	}

	async isDraft() {
		const hasPublishButton = await driverHelper.isElementPresent(
			this.driver,
			By.css( 'button.editor-post-publish-panel__toggle' )
		);
		const hasRevertButton = await driverHelper.isElementPresent(
			this.driver,
			By.css( 'button.editor-post-switch-to-draft' )
		);
		return hasPublishButton && ! hasRevertButton;
	}

	async viewPublishedPostOrPage() {
		const viewPostSelector = By.css( '.components-notice__content a' );
		await driverHelper.clickWhenClickable( this.driver, viewPostSelector );
	}

	async schedulePost( publishDate ) {
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.editor-post-publish-panel__toggle' )
		);
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.editor-post-publish-panel__header' )
		);
		await driverHelper.verifyTextPresent(
			this.driver,
			By.css( '.editor-post-publish-panel__link' ),
			publishDate
		);
		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.editor-post-publish-panel__header-publish-button button[aria-disabled=false]' )
		);
		await driverHelper.waitTillNotPresent(
			this.driver,
			By.css( '.editor-post-publish-panel__content .components-spinner' )
		);
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			By.css( '.editor-post-publish-panel__header-published' )
		);
		return await driverHelper.verifyTextPresent(
			this.driver,
			By.css( '.editor-post-publish-panel__header-published' ),
			'Scheduled'
		);
	}

	async closeScheduledPanel() {
		await driverHelper.clickWhenClickable( this.driver, By.css( '.dashicons-no-alt' ) );
	}
}
