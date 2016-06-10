import webdriver from 'selenium-webdriver';
import slack from 'slack-notify';

import config from 'config';

import * as driverHelper from '../driver-helper.js';
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
		this.editorFrameName = by.css( '#tinymce-1_ifr' );
		this.saveSelector = by.css( 'button.editor-ground-control__save' );

		if ( config.get( 'useNewMobileEditor' ) === true ) {
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
		} else {
			const writeButtonSelector = by.css( 'button.editor-sidebar__toggle-sidebar' );
			driver.findElement( writeButtonSelector ).isDisplayed().then( function( writeButtonDisplayed ) {
				if ( writeButtonDisplayed === true ) {
					driverHelper.clickWhenClickable( driver, writeButtonSelector );
				}
			} );
		}

		this.waitForPage();
		this.ensureEditorShown();
	}
	ensureEditorShown() {
		const driver = this.driver;
		driver.wait( until.elementLocated( this.editorFrameName ), this.explicitWaitMS ).then( function() { }, function( error ) {
			const message = `Found issue on editor iFrame: '${error}' - Refreshing the browser to see if this works.`;
			console.log( message );
			if ( config.has( 'slackHook' ) ) {
				let slackClient = slack( config.get( 'slackHook' ) );
				slackClient.send( {
					icon_emoji: ':a8c:',
					text: message,
					username: 'WebDriverJS'
				} );
			}
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

	uploadMedia( fileDetails ) {
		const driver = this.driver;
		const newFile = fileDetails.file;
		driverHelper.clickWhenClickable( driver, by.className( 'mce-media' ), this.explicitWaitMS );
		driver.wait( until.elementLocated( by.className( 'media-library__upload-button' ) ), this.explicitWaitMS, 'Could not locate the media library upload button.' );
		const fileNameInputSelector = webdriver.By.css( 'input[type="file"]' );
		driver.findElement( fileNameInputSelector ).sendKeys( newFile );
		driver.wait( elementIsNotPresent( '.media-library__list-item.is-transient' ), this.explicitWaitMS, 'Transient media is still present' );
		driver.wait( elementIsNotPresent( '.media-library .notice.is-error' ), 500, 'Upload error message is present' );
		driver.wait( until.elementLocated( by.css( '.media-library__list-item.is-selected' ) ), this.explicitWaitMS, 'Could not locate the newly uploaded item.' );
	}

	deleteMedia() {
		const driver = this.driver;
		let deleteSelector = webdriver.By.css( '.editor-media-modal__delete' );
		if ( screenSize === 'mobile' ) {
			const ellipsisSelector = webdriver.By.css( '.editor-media-modal__secondary-action.is-mobile' );
			driver.wait( until.elementLocated( ellipsisSelector ), this.explicitWaitMS, 'Could not locate the ellipsis button' );
			const ellipsisButton = driver.findElement( ellipsisSelector );
			ellipsisButton.click();
			deleteSelector = webdriver.By.xpath( "//button[contains(@class, 'popover__menu-item') and contains(text(), 'Delete' )]" );
		}
		driver.wait( until.elementLocated( deleteSelector ), this.explicitWaitMS, 'Could not locate the delete button in the media library' );
		const deleteButton = driver.findElement( deleteSelector );
		driver.wait( until.elementIsEnabled( deleteButton ), this.explicitWaitMS, 'The delete button is not enabled' );
		deleteButton.click();
		// Click on Accept Selector
		const acceptSelector = by.css( '.accept-dialog + .dialog__action-buttons button.is-primary' );
		driver.wait( until.elementLocated( acceptSelector ), this.explicitWaitMS, 'Could not locate the Ok button' );
		driver.findElement( acceptSelector ).click();
		driver.wait( elementIsNotPresent( '.media-library__list-item.is-selected' ), this.explicitWaitMS, 'Selected media is still present' );
	}

	dismissMediaModal() {
		const driver = this.driver;
		driver.findElement( by.css( '.editor-media-modal__secondary-actions + .button' ) ).click();
		driver.wait( elementIsNotPresent( '.dialog__backdrop.is-full-screen' ), this.explicitWaitMS, 'Dialog is still present' );
	}

	enterPostImage( fileDetails ) {
		let d = webdriver.promise.defer();
		let driver = this.driver;
		let newImageName = fileDetails.fileName;
		let newFile = fileDetails.file;
		driverHelper.clickWhenClickable( driver, by.className( 'mce-media' ), this.explicitWaitMS );
		driver.wait( until.elementLocated( by.className( 'media-library__upload-button' ) ), this.explicitWaitMS, 'Could not locate the media library upload button.' );
		let fileNameInputSelector = webdriver.By.css( 'input[type="file"]' );
		driver.findElement( fileNameInputSelector ).sendKeys( newFile );
		let imageUploadedSelector = webdriver.By.css( 'img[alt="' + newImageName + '"]' );
		driver.wait( until.elementLocated( imageUploadedSelector ), this.explicitWaitMS, 'Could not locate the uploaded image in the media library' );
		let insertSelector = webdriver.By.css( '.dialog__action-buttons button.is-primary' );
		driver.wait( until.elementLocated( insertSelector ), this.explicitWaitMS, 'Could not locate the insert image button in the media library' );
		let insertImageElement = driver.findElement( insertSelector );
		driver.wait( until.elementIsEnabled( insertImageElement ), this.explicitWaitMS, 'The insert image button is not enabled' );
		insertImageElement.click();
		d.fulfill( true );
		return d.promise;
	}
	waitUntilImageInserted( fileDetails ) {
		let d = webdriver.promise.defer();
		let driver = this.driver;
		let newImageName = fileDetails.fileName;
		driver.switchTo().frame( 'tinymce-1_ifr' );
		driver.wait( until.elementLocated( by.css( 'img[alt="' + newImageName + '"]' ) ), this.explicitWaitMS, 'Could not locate image in editor, check it is visible' );
		driver.switchTo().defaultContent();
		d.fulfill( true );
		return d.promise;
	}

	errorDisplayed() {
		this.driver.sleep( 1000 );
		return this.driver.isElementPresent( by.css( '.notice.is-error' ) );
	}

	setVisibilityToPrivate() {
		const visibilitySelector = by.css( 'button.editor-visibility svg' );
		let driver = this.driver;
		let visibilityElement = driver.findElement( visibilitySelector );
		driver.wait( until.elementIsVisible( visibilityElement ), this.explicitWaitMS, 'Could not see the visibility element' );
		driverHelper.clickWhenClickable( driver, visibilitySelector, this.explicitWaitMS );
		driverHelper.clickWhenClickable( driver, by.css( 'input[value=private]' ), this.explicitWaitMS );
		driverHelper.clickWhenClickable( driver, by.css( '.dialog button.is-primary' ), this.explicitWaitMS ); //Click Yes to publish
	}
	setVisibilityToPasswordProtected( password ) {
		const visibilitySelector = by.className( 'editor-visibility' );
		let driver = this.driver;
		let visibilityElement = driver.findElement( by.className( 'editor-visibility' ) );
		driver.wait( until.elementIsVisible( visibilityElement ), this.explicitWaitMS, 'Could not see the visibility element' );
		driverHelper.clickWhenClickable( driver, visibilitySelector, this.explicitWaitMS );
		driverHelper.clickWhenClickable( driver, by.css( 'input[value=password]' ), this.explicitWaitMS );
		driver.findElement( by.css( 'div.editor-visibility__dialog input[type=text]' ) ).sendKeys( password );
	}
	viewPublishedPostOrPage() {
		const viewPostSelector = by.className( 'notice__action' );
		let driver = this.driver;
		driver.wait( until.elementLocated( viewPostSelector ), this.explicitWaitMS, 'Could not locate the view blog post or page link.' );
		driver.findElement( viewPostSelector ).getAttribute( 'href' ).then( function( url ) {
			driver.get( url ); // Avoid opening in new window
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

	clickBackWithUnsavedChanges() {
		const driver = this.driver;
		const backButtonSelector = by.css( '.editor-sidebar__close' );
		driver.wait( until.elementLocated( backButtonSelector ), this.explicitWaitMS, 'Could not locate the back button' );
		driver.findElement( backButtonSelector ).click();
		driver.switchTo().alert().accept();
	}
}
