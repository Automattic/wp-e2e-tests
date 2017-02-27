import webdriver from 'selenium-webdriver';
import config from 'config';

import * as driverHelper from '../driver-helper.js';
import * as driverManager from '../driver-manager.js';
import * as slackNotifier from '../slack-notifier.js';
import { currentScreenSize } from '../driver-manager.js';

const by = webdriver.By;
const until = webdriver.until;

import BaseContainer from '../base-container.js';
const screenSize = currentScreenSize();

const elementIsNotPresent = function( cssSelector ) {
	return new until.Condition( 'for element to not be present', function( driver ) {
		return driver.isElementPresent( by.css( cssSelector ) ).then( function( isPresent ) {
			return ! isPresent;
		} );
	} );
};

export default class EditorPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.post-editor' ) );
		this.editorFrameName = by.css( '.mce-edit-area iframe' );
		this.saveSelector = by.css( 'button.editor-ground-control__save' );

		const writeButtonSelector = by.css( '.editor-mobile-navigation__tabs .gridicons-pencil.editor-mobile-navigation__icon' );
		driver.findElement( writeButtonSelector ).isDisplayed().then( function( writeButtonDisplayed ) {
			if ( writeButtonDisplayed === true ) {
				driver.findElement( writeButtonSelector ).getAttribute( 'class' ).then( ( c ) => {
					if ( c.indexOf( 'is-selected' ) < 0 ) {
						driverHelper.clickWhenClickable( driver, writeButtonSelector );
					}
				} );
			}
		} );

		this.waitForPage();
		this.ensureEditorShown();
	}
	ensureEditorShown() {
		const driver = this.driver;
		const self = this;
		return driver.wait( until.elementLocated( this.editorFrameName ), this.explicitWaitMS * 2 ).then( function() { }, function( error ) {
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
		self.driver.wait( elementIsNotPresent( '.media-library__list-item.is-transient' ), this.explicitWaitMS, 'Transient media is still present' );
		self.driver.wait( elementIsNotPresent( '.media-library .notice.is-error' ), 500, 'Upload error message is present' );
		return self.driver.wait( until.elementLocated( by.css( '.media-library__list-item.is-selected' ) ), this.explicitWaitMS, 'Could not locate the newly uploaded item.' );
	}

	insertContactForm() {
		driverHelper.clickWhenClickable( this.driver, by.css( '.mce-wpcom-insert-menu button.mce-open' ) );
		driverHelper.clickWhenClickable( this.driver, by.css( '.mce-menu .gridicons-mention' ) );
		return driverHelper.clickWhenClickable( this.driver, by.css( '.editor-contact-form-modal button.is-primary' ) );
	}

	enterPostImage( fileDetails ) {
		const self = this;
		const newImageName = fileDetails.imageName;
		const newFile = fileDetails.file;

		self._chooseInsertMediaOption();
		self.driver.wait( until.elementLocated( by.className( 'media-library__upload-button' ) ), this.explicitWaitMS, 'Could not locate the media library upload button.' );
		let fileNameInputSelector = webdriver.By.css( 'input[type="file"]' );
		self.driver.findElement( fileNameInputSelector ).sendKeys( newFile );
		self.driver.wait( elementIsNotPresent( '.media-library__list-item.is-transient' ), this.explicitWaitMS, 'Transient media is still present' );
		self.driver.wait( elementIsNotPresent( '.media-library .notice.is-error' ), 500, 'Upload error message is present' );
		let imageUploadedSelector = webdriver.By.css( 'img[alt="' + newImageName + '"]' );
		self.driver.wait( until.elementLocated( imageUploadedSelector ), this.explicitWaitMS, 'Could not locate the uploaded image in the media library' );
		return driverHelper.clickWhenClickable( self.driver, by.css( '.dialog__action-buttons button.is-primary' ) );
	}

	deleteMedia() {
		const driver = this.driver;
		let deleteSelector = webdriver.By.css( '.editor-media-modal__delete' );
		if ( screenSize === 'mobile' ) {
			const ellipsisSelector = webdriver.By.css( '.editor-media-modal__secondary-action.is-mobile' );
			driverHelper.clickWhenClickable( driver, ellipsisSelector );
			deleteSelector = webdriver.By.xpath( "//button[contains(@class, 'popover__menu-item') and contains(text(), 'Delete' )]" );
		}
		driverHelper.clickWhenClickable( driver, deleteSelector );
		return driver.sleep( 1000 ).then( () => {
			const acceptSelector = by.css( '.accept-dialog + .dialog__action-buttons button.is-primary' );
			driverHelper.clickWhenClickable( driver, acceptSelector );
			return driver.wait( elementIsNotPresent( '.media-library__list-item.is-selected' ), this.explicitWaitMS, 'Selected media is still present' );
		} );
	}

	dismissMediaModal() {
		const driver = this.driver;
		driverHelper.clickWhenClickable( driver, by.css( '.editor-media-modal__secondary-actions + .button' ) );
		return driver.wait( elementIsNotPresent( '.dialog__backdrop.is-full-screen' ), this.explicitWaitMS, 'Dialog is still present' );
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
		return this.driver.isElementPresent( by.css( '.notice.is-error' ) );
	}

	ensureContactFormDisplayedInPost() {
		this.driver.wait( until.ableToSwitchToFrame( this.editorFrameName ), this.explicitWaitMS, 'Could not locate the editor iFrame.' );
		driverHelper.waitTillPresentAndDisplayed( this.driver, by.css( '.wpview-type-contact-form' ) );
		return this.driver.switchTo().defaultContent();
	}

	setVisibilityToPrivate() {
		const visibilitySelector = by.css( 'button.editor-visibility svg' );
		const driver = this.driver;
		driverHelper.clickWhenClickable( driver, visibilitySelector );
		driverHelper.clickWhenClickable( driver, by.css( 'input[value=private]' ) );
		driverHelper.clickWhenClickable( driver, by.css( '.dialog button.is-primary' ) ); //Click Yes to publish
		return this.waitForSuccessViewPostNotice();
	}

	setVisibilityToPasswordProtected( password ) {
		const visibilitySelector = by.css( '.editor-visibility' );
		const driver = this.driver;
		driverHelper.clickWhenClickable( driver, visibilitySelector );
		driverHelper.clickWhenClickable( driver, by.css( 'input[value=password]' ) );
		return driverHelper.setWhenSettable( driver, by.css( 'div.editor-visibility__dialog input[type=text]' ), password, { secureValue: true } );
	}

	waitForSuccessViewPostNotice() {
		const successNoticeSelector = by.css( '.post-editor__notice.is-success,.post-editor-notice.is-success,.notice.is-success,.post-editor-notice.is-success' );
		const viewPostSelector = by.css( '.notice__action' );
		this.driver.wait( until.elementLocated( successNoticeSelector ), this.explicitWaitMS, 'Could not locate the successfully published notice.' );
		this.driver.wait( until.elementLocated( viewPostSelector ), this.explicitWaitMS, 'Could not locate the view blog post or page link.' );
	}

	viewPublishedPostOrPage() {
		const viewPostSelector = by.css( '.editor-notice a.notice__action' );
		const driver = this.driver;

		driver.wait( until.elementLocated( viewPostSelector ), this.explicitWaitMS, 'Could not locate the view blog post or page link.' );
		return driver.findElement( viewPostSelector ).getAttribute( 'href' ).then( function( url ) {
			return driver.get( url );
		} );
	}

	trashPost() {
		driverHelper.clickWhenClickable( this.driver, by.css( 'button.editor-delete-post' ), this.explicitWaitMS );
		return driverHelper.clickWhenClickable( this.driver, by.css( '.dialog button.is-primary' ), this.explicitWaitMS );
	}

	waitForTitle() {
		const driver = this.driver;
		const titleLoadingSelector = by.css( '.editor-title.is-loading' );
		driver.wait( function() {
			return driver.isElementPresent( titleLoadingSelector ).then( function( present ) {
				return ! present;
			} );
		}, this.explicitWaitMS, 'The title is loading element was still present when it should have disappeared by now.' );
	}
	titleShown() {
		return this.driver.findElement( by.css( '.editor-title__input' ) ).getAttribute( 'value' );
	}
}
