import webdriver from 'selenium-webdriver';

import config from 'config';

import * as driverHelper from '../driver-helper.js';

const by = webdriver.By;
const until = webdriver.until;

import BaseContainer from '../base-container.js';

export default class EditorPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.post-editor' ) );
		this.editorFrameName = 'tinymce-1_ifr';
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
	}
	enterTitle( blogPostTitle ) {
		return driverHelper.setWhenSettable( this.driver, by.css( '.editor-title__input' ), blogPostTitle );
	}
	enterContent( blogPostText ) {
		this.driver.switchTo().frame( this.editorFrameName );
		this.driver.findElement( webdriver.By.id( 'tinymce' ) ).sendKeys( blogPostText );
		this.driver.switchTo().defaultContent();
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
		driverHelper.clickWhenClickable( driver, by.css( 'div.dialog button[data-reactid*=accept]' ), this.explicitWaitMS ); //Click Yes to publish
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
		return driverHelper.clickWhenClickable( this.driver, by.css( 'button[data-reactid*=accept]' ), this.explicitWaitMS );
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
