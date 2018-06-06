/** @format */

import webdriver from 'selenium-webdriver';

import * as driverHelper from '../driver-helper.js';
import * as driverManager from '../driver-manager.js';
// import * as slackNotifier from '../slack-notifier.js';
import * as eyesHelper from '../eyes-helper.js';

const by = webdriver.By;
const until = webdriver.until;

import BaseContainer from '../base-container.js';

export default class EditorPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.post-editor' ) );
		this.editorFrameName = by.css( '.mce-edit-area iframe' );
		const contentSelector = by.css( 'div.is-section-post-editor' );
		const cogSelector = by.css( 'button.editor-ground-control__toggle-sidebar' );
		this.fileNameInputSelector = webdriver.By.css(
			'.media-library__upload-button input[type="file"]'
		);

		driverHelper.waitTillPresentAndDisplayed( driver, contentSelector );
		driver
			.findElement( contentSelector )
			.getAttribute( 'class' )
			.then( c => {
				if ( c.indexOf( 'focus-content' ) < 0 ) {
					driverHelper.clickWhenClickable( driver, cogSelector );
				}
			} );

		this.waitForPage();
		this.ensureEditorShown();
	}

	async ensureEditorShown() {
		const driver = this.driver;
		return await driverHelper.waitTillPresentAndDisplayed( driver, this.editorFrameName );
	}

	async enterTitle( blogPostTitle ) {
		return await driverHelper.setWhenSettable(
			this.driver,
			by.css( '.editor-title__input' ),
			blogPostTitle
		);
	}

	async enterContent( blogPostText ) {
		await this.driver.wait(
			until.ableToSwitchToFrame( this.editorFrameName ),
			this.explicitWaitMS,
			'Could not locate the editor iFrame.'
		);
		await this.driver.findElement( webdriver.By.id( 'tinymce' ) ).sendKeys( blogPostText );
		return await this.driver.switchTo().defaultContent();
	}

	async chooseInsertMediaOption() {
		await driverHelper.clickWhenClickable( this.driver, by.css( '.mce-wpcom-insert-menu button' ) );
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			by.css( 'span[data-e2e-insert-type="media"]' )
		);
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( 'span[data-e2e-insert-type="media"]' )
		);
	}

	async uploadMedia( fileDetails ) {
		const self = this;
		const newFile = fileDetails.file;

		await self.chooseInsertMediaOption();
		await self.sendFile( newFile );
		return await self.driver.sleep( 1000 );
	}

	async sendFile( file ) {
		const driver = this.driver;

		await driverHelper.waitTillPresentAndDisplayed(
			driver,
			by.className( 'media-library__upload-button' )
		);
		let fileNameInput = await driver.findElement( this.fileNameInputSelector );
		await fileNameInput.sendKeys( file );
		await driverHelper.elementIsNotPresent( driver, '.media-library__list-item.is-transient' );
		await driverHelper.elementIsNotPresent( driver, '.media-library .notice.is-error' );
		return await driverHelper.waitTillPresentAndDisplayed(
			driver,
			by.css( '.media-library__list-item.is-selected' )
		);
	}

	async saveImage( fileName ) {
		const driver = this.driver;

		let imageUploadedSelector = webdriver.By.css( 'img[alt="' + fileName + '"]' );
		await driverHelper.waitTillPresentAndDisplayed( driver, imageUploadedSelector );
		return await driverHelper.clickWhenClickable(
			driver,
			by.css( 'button[data-e2e-button="confirm"]' )
		);
	}

	async openImageDetails() {
		const driver = this.driver;
		let editSelector = by.css( 'button[data-e2e-button="edit"]' );
		driver.wait(
			until.elementLocated( editSelector ),
			this.explicitWaitMS,
			'Could not locate the edit button in the media library'
		);
		const editButton = await driver.findElement( editSelector );
		driver.wait(
			until.elementIsEnabled( editButton ),
			this.explicitWaitMS,
			'The edit button is not enabled'
		);
		return await editButton.click();
	}

	async selectEditImage() {
		const driver = this.driver;
		let editSelector = by.css( '.editor-media-modal-detail__edit' );
		if ( driverManager.currentScreenSize() === 'mobile' ) {
			editSelector = by.css( '.is-mobile .editor-media-modal-detail__edit' );
		}
		driver.wait(
			until.elementLocated( editSelector ),
			this.explicitWaitMS,
			'Could not locate the edit image button'
		);
		const editImageButton = await driver.findElement( editSelector );
		driver.wait(
			until.elementIsEnabled( editImageButton ),
			this.explicitWaitMS,
			'The edit image button is not enabled'
		);
		return await editImageButton.click();
	}

	async waitForImageEditor() {
		const driver = this.driver;
		const imageEditorPlaceholderSelector = by.css( '.image-editor__canvas.is-placeholder' );
		return driver.wait(
			async function() {
				let present = await driverHelper.isElementPresent( driver, imageEditorPlaceholderSelector );
				return ! present;
			},
			this.explicitWaitMS,
			'The image editor placeholder element was still present when it should have disappeared by now.'
		);
	}

	async dismissImageEditor() {
		const driver = this.driver;
		let cancelSelector = by.css( 'button[data-e2e-button="cancel"]' );
		const cancelButton = await driver.findElement( cancelSelector );
		driver.wait(
			until.elementIsEnabled( cancelButton ),
			this.explicitWaitMS,
			'The edit image button is not enabled'
		);
		return await cancelButton.click();
	}

	async dismissImageDetails() {
		const driver = this.driver;
		let backSelector = by.css( '.editor-media-modal-detail .header-cake__back' );
		driver.wait(
			until.elementLocated( backSelector ),
			this.explicitWaitMS,
			'Could not locate the Media Library back button'
		);
		const backButton = await driver.findElement( backSelector );
		driver.wait(
			until.elementIsEnabled( backButton ),
			this.explicitWaitMS,
			'The back button is not enabled'
		);
		return await backButton.click();
	}

	async selectImageByNumber( count ) {
		const driver = this.driver;

		driver.wait(
			until.elementLocated( by.className( 'media-library__upload-button' ) ),
			this.explicitWaitMS,
			'Could not locate the media library upload button.'
		);
		driver.wait(
			until.elementsLocated( by.css( '.media-library__list-item:not(.is-placeholder)' ) ),
			this.explicitWaitMS,
			'Could not locate image elements.'
		);
		let elements = await driver.findElements( by.className( 'media-library__list-item' ) );
		await elements[ count ].click();
		return driver.wait(
			until.elementLocated( by.css( '.media-library__list-item.is-selected' ) ),
			this.explicitWaitMS,
			'Could not locate the selected media item.'
		);
	}

	async insertContactForm() {
		await driverHelper.clickWhenClickable( this.driver, by.css( '.mce-wpcom-insert-menu button' ) );
		await driverHelper.clickWhenClickable(
			this.driver,
			by.css( 'span[data-e2e-insert-type="contact-form"]' )
		);
		return await driverHelper.clickWhenClickable(
			this.driver,
			by.css( 'button[data-e2e-button="save"]' )
		);
	}

	async insertPaymentButton(
		eyes,
		{
			title = 'Button',
			description = 'Description',
			price = '1.00',
			currency = 'AUD',
			allowQuantity = true,
			email = 'test@wordpress.com',
		} = {}
	) {
		await driverHelper.clickWhenClickable( this.driver, by.css( '.mce-wpcom-insert-menu button' ) );
		await driverHelper.clickWhenClickable(
			this.driver,
			by.css( 'span[data-e2e-insert-type="payment-button"]' )
		);
		await driverHelper.clickIfPresent(
			this.driver,
			by.css( '.editor-simple-payments-modal button svg.gridicons-plus-small' ),
			2
		);
		await driverHelper.setWhenSettable(
			this.driver,
			by.css( '.editor-simple-payments-modal__form #title' ),
			title
		);
		await driverHelper.setWhenSettable(
			this.driver,
			by.css( '.editor-simple-payments-modal__form #description' ),
			description
		);
		await driverHelper.setWhenSettable(
			this.driver,
			by.css( '.editor-simple-payments-modal__form #price' ),
			price
		);
		driverHelper.clickWhenClickable(
			this.driver,
			by.css(
				`.editor-simple-payments-modal__form .form-currency-input__select option[value="${ currency }"]`
			)
		);
		if ( email ) {
			await driverHelper.setWhenSettable(
				this.driver,
				by.css( '.editor-simple-payments-modal__form #email' ),
				email
			);
		}
		if ( allowQuantity === true ) {
			await driverHelper.clickWhenClickable(
				this.driver,
				by.css( '.editor-simple-payments-modal__form .form-toggle__switch' )
			);
		}
		if ( eyes ) {
			await eyesHelper.eyesScreenshot( this.driver, eyes, 'Create New Payment Button' );
		}
		return driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.editor-simple-payments-modal button.is-primary' )
		);
	}

	async enterPostImage( fileDetails ) {
		const self = this;
		const newImageName = fileDetails.imageName;
		const newFile = fileDetails.file;

		await self.chooseInsertMediaOption();
		await self.sendFile( newFile );
		let imageUploadedSelector = webdriver.By.css( 'img[alt="' + newImageName + '"]' );
		await self.driver.wait(
			until.elementLocated( imageUploadedSelector ),
			this.explicitWaitMS,
			'Could not locate the uploaded image in the media library'
		);
		return await driverHelper.clickWhenClickable(
			self.driver,
			by.css( 'button[data-e2e-button="confirm"]' )
		);
	}

	async deleteMedia() {
		let deleteSelector = by.css( '.editor-media-modal__delete' );
		let acceptSelector = by.css( 'button[data-e2e-button="accept"]' );

		await driverHelper.clickWhenClickable( this.driver, deleteSelector );
		return await driverHelper.clickWhenClickable( this.driver, acceptSelector );
	}

	async dismissMediaModal() {
		const driver = this.driver;
		const cancelSelector = by.css( 'button[data-e2e-button="cancel"]' );
		let button = await driver.findElement( cancelSelector );
		await button.click();
		return driver.wait(
			driverHelper.elementIsNotPresent( this.driver, '.dialog__backdrop.is-full-screen' ),
			this.explicitWaitMS,
			'Dialog is still present'
		);
	}

	async waitUntilImageInserted( fileDetails ) {
		const self = this;
		const newImageName = fileDetails.imageName;
		await self.driver.wait(
			until.ableToSwitchToFrame( self.editorFrameName ),
			self.explicitWaitMS,
			'Could not locate the editor iFrame.'
		);
		await self.driver.wait(
			until.elementLocated( by.css( 'img[alt="' + newImageName + '"]' ) ),
			this.explicitWaitMS,
			'Could not locate image in editor, check it is visible'
		);
		return await self.driver.switchTo().defaultContent();
	}

	async waitUntilFeaturedImageInserted() {
		const driver = this.driver;

		await driverHelper.waitTillPresentAndDisplayed(
			driver,
			by.css( '.post-editor__inner-content .editor-featured-image__preview' )
		);
		await driverHelper.waitTillPresentAndDisplayed(
			driver,
			by.css( '[data-e2e-title="featured-image"] .editor-featured-image__preview img' )
		);
		return await driver.switchTo().defaultContent();
	}

	async errorDisplayed() {
		this.driver.sleep( 1000 );
		return await driverHelper.isElementPresent( this.driver, by.css( '.notice.is-error' ) );
	}

	async ensureContactFormDisplayedInPost() {
		await this.driver.wait(
			until.ableToSwitchToFrame( this.editorFrameName ),
			this.explicitWaitMS,
			'Could not locate the editor iFrame.'
		);
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			by.css( '.wpview-type-contact-form' )
		);
		return await this.driver.switchTo().defaultContent();
	}

	async ensurePaymentButtonDisplayedInPost() {
		await this.driver.wait(
			until.ableToSwitchToFrame( this.editorFrameName ),
			this.explicitWaitMS,
			'Could not locate the editor iFrame.'
		);
		await driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			by.css( '.wpview-type-simple-payments' )
		);
		return await this.driver.switchTo().defaultContent();
	}

	async waitForTitle() {
		const driver = this.driver;
		const titleLoadingSelector = by.css( '.editor-title.is-loading' );
		driver.wait(
			async function() {
				let present = await driverHelper.isElementPresent( driver, titleLoadingSelector );
				return ! present;
			},
			this.explicitWaitMS,
			'The title is loading element was still present when it should have disappeared by now.'
		);
	}

	async titleShown() {
		let titleSelector = by.css( '.editor-title__input' );
		driverHelper.waitTillPresentAndDisplayed( this.driver, titleSelector );
		return await this.driver.findElement( titleSelector ).getAttribute( 'value' );
	}

	async publishEnabled() {
		const publishSelector = by.css( '.editor-publish-button' );
		let d = await this.driver.findElement( publishSelector ).getAttribute( 'disabled' );
		return d !== 'true';
	}

	async emailVerificationNoticeDisplayed() {
		const emailVerificationSelector = by.css( '.editor-ground-control__email-verification-notice' );
		return await driverHelper.isElementPresent( this.driver, emailVerificationSelector );
	}

	async postIsScheduled() {
		return await driverHelper.isElementPresent(
			this.driver,
			by.css(
				'.post-editor__inner .post-editor__content .editor-action-bar .editor-status-label.is-future'
			)
		);
	}
}
