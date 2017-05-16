import webdriver from 'selenium-webdriver';

import * as driverHelper from '../driver-helper.js';
import * as driverManager from '../driver-manager.js';
import * as slackNotifier from '../slack-notifier.js';

const by = webdriver.By;
const until = webdriver.until;

import BaseContainer from '../base-container.js';

export default class EditorPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.post-editor' ) );
		this.editorFrameName = by.css( '.mce-edit-area iframe' );
		const contentSelector = by.css( 'div.is-section-post-editor' );
		const cogSelector = by.css( 'button.editor-ground-control__toggle-sidebar' );

		driverHelper.waitTillPresentAndDisplayed( driver, contentSelector );
		driver.findElement( contentSelector ).getAttribute( 'class' ).then( ( c ) => {
			if ( c.indexOf( 'focus-content' ) < 0 ) {
				driverHelper.clickWhenClickable( driver, cogSelector );
			}
		} );

		this.waitForPage();
		this.ensureEditorShown();
	}

	ensureEditorShown() {
		const driver = this.driver;
		const self = this;
		driver.wait( until.elementLocated( this.editorFrameName ), this.explicitWaitMS * 2 ).then( function() { }, function( error ) {
			const message = `Found issue on editor iFrame: '${error}' for '${driverManager.currentScreenSize()}' browser - Refreshing the browser to see if this works.`;
			slackNotifier.warn( message );
			self.takeScreenShot( 'EditorPageFailed' );
			return driver.navigate().refresh();
		} );
	}

	enterTitle( blogPostTitle ) {
		return driverHelper.setWhenSettable( this.driver, by.css( '.editor-title__input' ), blogPostTitle );
	}

	enterContent( blogPostText ) {
		this.driver.wait( until.ableToSwitchToFrame( this.editorFrameName ), this.explicitWaitMS, 'Could not locate the editor iFrame.' );
		this.driver.findElement( webdriver.By.id( 'tinymce' ) ).sendKeys( blogPostText );
		this.driver.switchTo().defaultContent();
	}

	_chooseInsertMediaOption() {
		driverHelper.clickWhenClickable( this.driver, by.css( '.mce-wpcom-insert-menu button.mce-open' ) );
		return driverHelper.clickWhenClickable( this.driver, by.css( '.mce-menu .gridicons-add-image' ) );
	}

	uploadMedia( fileDetails ) {
		const self = this;
		const newFile = fileDetails.file;

		self._chooseInsertMediaOption();
		self.driver.wait( until.elementLocated( by.className( 'media-library__upload-button' ) ), this.explicitWaitMS, 'Could not locate the media library upload button.' );
		const fileNameInputSelector = webdriver.By.css( 'input[type="file"]' );
		self.driver.findElement( fileNameInputSelector ).sendKeys( newFile );
		self.driver.wait( driverHelper.elementIsNotPresent( this.driver, '.media-library__list-item.is-transient' ), this.explicitWaitMS, 'Transient media is still present' );
		self.driver.wait( driverHelper.elementIsNotPresent( this.driver, '.media-library .notice.is-error' ), 500, 'Upload error message is present' );
		return self.driver.wait( until.elementLocated( by.css( '.media-library__list-item.is-selected' ) ), this.explicitWaitMS, 'Could not locate the newly uploaded item.' );
	}

	insertContactForm() {
		driverHelper.clickWhenClickable( this.driver, by.css( '.mce-wpcom-insert-menu button.mce-open' ) );
		driverHelper.clickWhenClickable( this.driver, by.css( '.mce-menu .gridicons-mention' ) );
		return driverHelper.clickWhenClickable( this.driver, by.css( 'button[data-e2e-button="Insert"]' ) );
	}

	enterPostImage( fileDetails ) {
		const self = this;
		const newImageName = fileDetails.imageName;
		const newFile = fileDetails.file;

		self._chooseInsertMediaOption();
		self.driver.wait( until.elementLocated( by.className( 'media-library__upload-button' ) ), this.explicitWaitMS, 'Could not locate the media library upload button.' );
		let fileNameInputSelector = webdriver.By.css( 'input[type="file"]' );
		self.driver.findElement( fileNameInputSelector ).sendKeys( newFile );
		self.driver.wait( driverHelper.elementIsNotPresent( this.driver, '.media-library__list-item.is-transient' ), this.explicitWaitMS, 'Transient media is still present' );
		self.driver.wait( driverHelper.elementIsNotPresent( this.driver, '.media-library .notice.is-error' ), 500, 'Upload error message is present' );
		let imageUploadedSelector = webdriver.By.css( 'img[alt="' + newImageName + '"]' );
		self.driver.wait( until.elementLocated( imageUploadedSelector ), this.explicitWaitMS, 'Could not locate the uploaded image in the media library' );
		return driverHelper.clickWhenClickable( self.driver, by.css( 'button[data-e2e-button="OK"]' ) );
	}

	deleteMedia() {
		const driver = this.driver;
		let deleteSelector = webdriver.By.css( '.editor-media-modal__delete' );
		driver.wait( until.elementLocated( deleteSelector ), this.explicitWaitMS, 'Could not locate the delete button in the media library' );
		const deleteButton = driver.findElement( deleteSelector );
		driver.wait( until.elementIsEnabled( deleteButton ), this.explicitWaitMS, 'The delete button is not enabled' );
		deleteButton.click();
		// Click on Accept Selector
		const acceptSelector = by.css( 'button[data-e2e-button="OK"]' );
		driver.wait( until.elementLocated( acceptSelector ), this.explicitWaitMS, 'Could not locate the Ok button' );
		driver.findElement( acceptSelector ).click();
		driver.wait( driverHelper.elementIsNotPresent( this.driver, '.media-library__list-item.is-selected' ), this.explicitWaitMS, 'Selected media is still present' );
	}

	dismissMediaModal() {
		const driver = this.driver;
		const cancelSelector = webdriver.By.css( 'button[data-e2e-button="Cancel"]' );
		driver.findElement( cancelSelector ).click();
		driver.wait( driverHelper.elementIsNotPresent( this.driver, '.dialog__backdrop.is-full-screen' ), this.explicitWaitMS, 'Dialog is still present' );
	}

	waitUntilImageInserted( fileDetails ) {
		const self = this;
		const newImageName = fileDetails.imageName;
		self.driver.wait( until.ableToSwitchToFrame( self.editorFrameName ), self.explicitWaitMS, 'Could not locate the editor iFrame.' );
		self.driver.wait( until.elementLocated( by.css( 'img[alt="' + newImageName + '"]' ) ), this.explicitWaitMS, 'Could not locate image in editor, check it is visible' );
		return self.driver.switchTo().defaultContent();
	}

	errorDisplayed() {
		this.driver.sleep( 1000 );
		return driverHelper.isElementPresent( this.driver, by.css( '.notice.is-error' ) );
	}

	ensureContactFormDisplayedInPost() {
		this.driver.wait( until.ableToSwitchToFrame( this.editorFrameName ), this.explicitWaitMS, 'Could not locate the editor iFrame.' );
		driverHelper.waitTillPresentAndDisplayed( this.driver, by.css( '.wpview-type-contact-form' ) );
		this.driver.switchTo().defaultContent();
	}

	waitForTitle() {
		const driver = this.driver;
		const titleLoadingSelector = by.css( '.editor-title.is-loading' );
		driver.wait( function() {
			return driverHelper.isElementPresent( driver, titleLoadingSelector ).then( function( present ) {
				return ! present;
			} );
		}, this.explicitWaitMS, 'The title is loading element was still present when it should have disappeared by now.' );
	}

	titleShown() {
		return this.driver.findElement( by.css( '.editor-title__input' ) ).getAttribute( 'value' );
	}
}
