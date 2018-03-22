/** @format */

import webdriver from 'selenium-webdriver';

import * as driverHelper from '../driver-helper.js';
import * as driverManager from '../driver-manager.js';
import * as slackNotifier from '../slack-notifier.js';
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
					return driverHelper.clickWhenClickable( driver, cogSelector );
				}
			} );

		this.waitForPage();
		this.ensureEditorShown();
	}

	ensureEditorShown() {
		const driver = this.driver;
		const self = this;
		driver.wait( until.elementLocated( this.editorFrameName ), this.explicitWaitMS * 2 ).then(
			() => {},
			error => {
				const message = `Found issue on editor iFrame: '${ error }' for '${ driverManager.currentScreenSize() }' browser - Refreshing the browser to see if this works.`;
				slackNotifier.warn( message );
				self.takeScreenShot( 'EditorPageFailed' );
				return driver.navigate().refresh();
			}
		);
	}

	enterTitle( blogPostTitle ) {
		return driverHelper.setWhenSettable(
			this.driver,
			by.css( '.editor-title__input' ),
			blogPostTitle
		);
	}

	enterContent( blogPostText ) {
		this.driver.wait(
			until.ableToSwitchToFrame( this.editorFrameName ),
			this.explicitWaitMS,
			'Could not locate the editor iFrame.'
		);
		this.driver.findElement( webdriver.By.id( 'tinymce' ) ).sendKeys( blogPostText );
		this.driver.switchTo().defaultContent();
	}

	chooseInsertMediaOption() {
		driverHelper.clickWhenClickable( this.driver, by.css( '.mce-wpcom-insert-menu button' ) );
		return driverHelper.clickWhenClickable(
			this.driver,
			by.css( 'span[data-e2e-insert-type="media"]' )
		);
	}

	uploadMedia( fileDetails ) {
		const self = this;
		const newFile = fileDetails.file;

		self.chooseInsertMediaOption();
		return self.sendFile( newFile );
	}

	sendFile( file ) {
		const driver = this.driver;

		driver.wait(
			until.elementLocated( by.className( 'media-library__upload-button' ) ),
			this.explicitWaitMS,
			'Could not locate the media library upload button.'
		);
		driver.findElement( this.fileNameInputSelector ).sendKeys( file );
		driver.wait(
			driverHelper.elementIsNotPresent( this.driver, '.media-library__list-item.is-transient' ),
			this.explicitWaitMS,
			'Transient media is still present'
		);
		driver.wait(
			driverHelper.elementIsNotPresent( this.driver, '.media-library .notice.is-error' ),
			500,
			'Upload error message is present'
		);
		return driver.wait(
			until.elementLocated( by.css( '.media-library__list-item.is-selected' ) ),
			this.explicitWaitMS,
			'Could not locate the newly uploaded item.'
		);
	}

	saveImage( fileName ) {
		const driver = this.driver;

		let imageUploadedSelector = webdriver.By.css( 'img[alt="' + fileName + '"]' );
		driver.wait(
			until.elementLocated( imageUploadedSelector ),
			this.explicitWaitMS,
			'Could not locate the uploaded image in the media library'
		);
		return driverHelper.clickWhenClickable( driver, by.css( 'button[data-e2e-button="confirm"]' ) );
	}

	openImageDetails() {
		const driver = this.driver;
		let editSelector = by.css( 'button[data-e2e-button="edit"]' );
		driver.wait(
			until.elementLocated( editSelector ),
			this.explicitWaitMS,
			'Could not locate the edit button in the media library'
		);
		const editButton = driver.findElement( editSelector );
		driver.wait(
			until.elementIsEnabled( editButton ),
			this.explicitWaitMS,
			'The edit button is not enabled'
		);
		editButton.click();
	}

	selectEditImage() {
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
		const editImageButton = driver.findElement( editSelector );
		driver.wait(
			until.elementIsEnabled( editImageButton ),
			this.explicitWaitMS,
			'The edit image button is not enabled'
		);
		editImageButton.click();
	}

	waitForImageEditor() {
		const imageEditorPlaceholderSelector = by.css( '.image-editor__canvas.is-placeholder' );

		return driverHelper.waitTillNotPresent( this.driver, imageEditorPlaceholderSelector );
	}

	dismissImageEditor() {
		const driver = this.driver;
		let cancelSelector = by.css( 'button[data-e2e-button="cancel"]' );
		const cancelButton = driver.findElement( cancelSelector );
		driver.wait(
			until.elementIsEnabled( cancelButton ),
			this.explicitWaitMS,
			'The edit image button is not enabled'
		);
		cancelButton.click();
	}

	dismissImageDetails() {
		const driver = this.driver;
		let backSelector = by.css( '.editor-media-modal-detail .header-cake__back' );
		driver.wait(
			until.elementLocated( backSelector ),
			this.explicitWaitMS,
			'Could not locate the Media Library back button'
		);
		const backButton = driver.findElement( backSelector );
		driver.wait(
			until.elementIsEnabled( backButton ),
			this.explicitWaitMS,
			'The back button is not enabled'
		);
		backButton.click();
	}

	selectImageByNumber( count ) {
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
		driver
			.findElements( by.className( 'media-library__list-item' ) )
			.then( elements => elements[ count ].click() );
		return driver.wait(
			until.elementLocated( by.css( '.media-library__list-item.is-selected' ) ),
			this.explicitWaitMS,
			'Could not locate the selected media item.'
		);
	}

	insertContactForm() {
		driverHelper.clickWhenClickable( this.driver, by.css( '.mce-wpcom-insert-menu button' ) );
		driverHelper.clickWhenClickable(
			this.driver,
			by.css( 'span[data-e2e-insert-type="contact-form"]' )
		);
		return driverHelper.clickWhenClickable(
			this.driver,
			by.css( 'button[data-e2e-button="save"]' )
		);
	}

	insertPaymentButton(
		eyes,
		{
			title = 'Button',
			description = 'Description',
			price = '1.00',
			allowQuantity = true,
			email = 'test@wordpress.com',
		} = {}
	) {
		driverHelper.clickWhenClickable( this.driver, by.css( '.mce-wpcom-insert-menu button' ) );
		driverHelper.clickWhenClickable(
			this.driver,
			by.css( 'span[data-e2e-insert-type="payment-button"]' )
		);
		driverHelper.clickIfPresent(
			this.driver,
			by.css( '.editor-simple-payments-modal button svg.gridicons-plus-small' ),
			2
		);
		driverHelper.setWhenSettable(
			this.driver,
			by.css( '.editor-simple-payments-modal__form #title' ),
			title
		);
		driverHelper.setWhenSettable(
			this.driver,
			by.css( '.editor-simple-payments-modal__form #description' ),
			description
		);
		driverHelper.setWhenSettable(
			this.driver,
			by.css( '.editor-simple-payments-modal__form #price' ),
			price
		);
		if ( email ) {
			driverHelper.setWhenSettable(
				this.driver,
				by.css( '.editor-simple-payments-modal__form #email' ),
				email
			);
		}
		if ( allowQuantity === true ) {
			driverHelper.clickWhenClickable(
				this.driver,
				by.css( '.editor-simple-payments-modal__form .form-toggle__switch' )
			);
		}
		eyesHelper.eyesScreenshot( this.driver, eyes, 'Create New Payment Button' );
		return driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.editor-simple-payments-modal button.is-primary' )
		);
	}

	enterPostImage( fileDetails ) {
		const self = this;
		const newImageName = fileDetails.imageName;
		const newFile = fileDetails.file;

		self.chooseInsertMediaOption();
		self.sendFile( newFile );
		let imageUploadedSelector = webdriver.By.css( 'img[alt="' + newImageName + '"]' );
		self.driver.wait(
			until.elementLocated( imageUploadedSelector ),
			this.explicitWaitMS,
			'Could not locate the uploaded image in the media library'
		);
		return driverHelper.clickWhenClickable(
			self.driver,
			by.css( 'button[data-e2e-button="confirm"]' )
		);
	}

	deleteMedia() {
		const driver = this.driver;
		let deleteSelector = webdriver.By.css( '.editor-media-modal__delete' );
		driver.wait(
			until.elementLocated( deleteSelector ),
			this.explicitWaitMS,
			'Could not locate the delete button in the media library'
		);
		const deleteButton = driver.findElement( deleteSelector );
		driver.wait(
			until.elementIsEnabled( deleteButton ),
			this.explicitWaitMS,
			'The delete button is not enabled'
		);
		deleteButton.click();
		// Click on Accept Selector
		const acceptSelector = by.css( 'button[data-e2e-button="accept"]' );
		driver.wait(
			until.elementLocated( acceptSelector ),
			this.explicitWaitMS,
			'Could not locate the Ok button'
		);
		driver.findElement( acceptSelector ).click();
		driver.wait(
			driverHelper.elementIsNotPresent( this.driver, '.media-library__list-item.is-selected' ),
			this.explicitWaitMS,
			'Selected media is still present'
		);
	}

	dismissMediaModal() {
		const driver = this.driver;
		const cancelSelector = by.css( 'button[data-e2e-button="cancel"]' );
		driver.findElement( cancelSelector ).click();
		driver.wait(
			driverHelper.elementIsNotPresent( this.driver, '.dialog__backdrop.is-full-screen' ),
			this.explicitWaitMS,
			'Dialog is still present'
		);
	}

	waitUntilImageInserted( fileDetails ) {
		const self = this;
		const newImageName = fileDetails.imageName;
		self.driver.wait(
			until.ableToSwitchToFrame( self.editorFrameName ),
			self.explicitWaitMS,
			'Could not locate the editor iFrame.'
		);
		self.driver.wait(
			until.elementLocated( by.css( 'img[alt="' + newImageName + '"]' ) ),
			this.explicitWaitMS,
			'Could not locate image in editor, check it is visible'
		);
		return self.driver.switchTo().defaultContent();
	}

	waitUntilFeaturedImageInserted() {
		const driver = this.driver;
		driver.wait(
			until.elementLocated(
				by.css( '.post-editor__inner-content .editor-featured-image__preview' )
			),
			this.explicitWaitMS,
			'Could not locate image in editor, check it is visible'
		);
		driver.wait(
			until.elementLocated(
				by.css( '[data-e2e-title="featured-image"] .editor-featured-image__preview img' )
			),
			this.explicitWaitMS,
			'Could not locate image in editor, check it is visible'
		);
		return driver.switchTo().defaultContent();
	}

	errorDisplayed() {
		this.driver.sleep( 1000 );
		return driverHelper.isElementPresent( this.driver, by.css( '.notice.is-error' ) );
	}

	ensureContactFormDisplayedInPost() {
		this.driver.wait(
			until.ableToSwitchToFrame( this.editorFrameName ),
			this.explicitWaitMS,
			'Could not locate the editor iFrame.'
		);
		driverHelper.waitTillPresentAndDisplayed( this.driver, by.css( '.wpview-type-contact-form' ) );
		this.driver.switchTo().defaultContent();
	}

	ensurePaymentButtonDisplayedInPost() {
		this.driver.wait(
			until.ableToSwitchToFrame( this.editorFrameName ),
			this.explicitWaitMS,
			'Could not locate the editor iFrame.'
		);
		driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			by.css( '.wpview-type-simple-payments' )
		);
		this.driver.switchTo().defaultContent();
	}

	waitForTitle() {
		const titleLoadingSelector = by.css( '.editor-title.is-loading' );
		driverHelper.waitTillNotPresent( this.driver, titleLoadingSelector );
	}

	titleShown() {
		return this.driver.findElement( by.css( '.editor-title__input' ) ).getAttribute( 'value' );
	}

	publishEnabled() {
		const publishSelector = by.css( '.editor-publish-button' );
		return this.driver
			.findElement( publishSelector )
			.getAttribute( 'disabled' )
			.then( d => d !== 'true' );
	}

	emailVerificationNoticeDisplayed() {
		const emailVerificationSelector = by.css( '.editor-ground-control__email-verification-notice' );
		return driverHelper.isElementPresent( this.driver, emailVerificationSelector );
	}

	cleanDirtyState() {
		this.driver.getCurrentUrl().then( url => {
			driverManager.dismissAllAlerts( this.driver );
			return this.driver.get( url );
		} );
	}

	postIsScheduled() {
		return driverHelper.isElementPresent(
			this.driver,
			by.css(
				'.post-editor__inner .post-editor__content .editor-action-bar .editor-status-label.is-future'
			)
		);
	}
}
