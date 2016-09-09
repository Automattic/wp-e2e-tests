import { By as by, until } from 'selenium-webdriver';
import BaseContainer from '../../base-container';
import * as driverHelper from '../../driver-helper';

export default class WPAdminAddPostPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '#post' ) );
		this.editorFrameName = by.css( '#content_ifr' );
	}

	publicizeDefaults() {
		return this.driver.findElement( by.css( '#publicize-defaults' ) ).getText();
	}

	enterCustomPublicizeMessage( customMessage ) {
		this._openPublicizeDetails();
		return driverHelper.setWhenSettable( this.driver, by.css( 'textarea#wpas-title' ), customMessage );
	}

	enterTitle( title ) {
		return driverHelper.setWhenSettable( this.driver, by.css( '#title' ), title );
	}

	enterContent( blogPostText ) {
		this.driver.wait( until.ableToSwitchToFrame( this.editorFrameName ), this.explicitWaitMS, 'Could not locate the editor iFrame.' );
		this.driver.findElement( by.css( '#tinymce' ) ).sendKeys( blogPostText );
		return this.driver.switchTo().defaultContent();
	}

	enterPostImage( fileDetails ) {
		const self = this;
		const newFile = fileDetails.file;
		const insertImageSelector = by.css( '.media-button-insert' );

		driverHelper.clickWhenClickable( self.driver, by.css( '#insert-media-button' ) );
		self.driver.findElement( by.css( 'input[type="file"]' ) ).sendKeys( newFile );
		self.driver.wait( function() {
			return self.driver.findElement( insertImageSelector ).getAttribute( 'disabled' ).then( ( d ) => {
				return d !== 'true';
			} );
		}, this.explicitWaitMS, 'The insert into post button is still disabled after uploading the image' );
		return driverHelper.clickWhenClickable( self.driver, insertImageSelector );
	}

	waitUntilImageInserted( fileDetails ) {
		const self = this;
		const newImageName = fileDetails.imageName;
		self.driver.wait( until.ableToSwitchToFrame( self.editorFrameName ), self.explicitWaitMS, 'Could not locate the editor iFrame.' );
		self.driver.wait( until.elementLocated( by.css( 'img[alt="' + newImageName + '"]' ) ), this.explicitWaitMS, 'Could not locate image in editor, check it is visible' );
		return self.driver.switchTo().defaultContent();
	}

	publicizeMessageShown() {
		const self = this;
		const selector = by.css( 'textarea#wpas-title' );
		self._openPublicizeDetails();
		self.driver.wait( function() {
			return self.driver.findElement( selector ).getText( ).then( ( t ) => {
				return t !== '';
			} );
		}, this.explicitWaitMS, 'The publicize message is still blank after waiting for it to not be' );
		return this.driver.findElement( selector ).getText();
	}

	_openPublicizeDetails() {
		const self = this;
		const openSelector = by.css( 'a#publicize-form-edit' );

		return self.driver.findElement( openSelector ).then( ( openElement ) => {
			return openElement.isDisplayed().then( ( displayed ) => {
				if ( displayed === true ) {
					return driverHelper.clickWhenClickable( self.driver, openSelector );
				}
			} )
		} );
	}

	publish() {
		const self = this;
		const publishSelector = by.css( '#publish' );
		const publishedSelector = by.css( '#message.updated' );
		self.driver.wait( function() {
			return self.driver.findElement( publishSelector ).getAttribute( 'disabled' ).then( ( d ) => {
				return d !== 'true';
			} );
		}, this.explicitWaitMS, 'The publish button is still disabled after waiting for it' );
		driverHelper.clickWhenClickable( this.driver, publishSelector );
		driverHelper.isEventuallyPresentAndDisplayed( this.driver, publishedSelector ).then( ( published ) => {
			if ( published === false ) {
				driverHelper.clickWhenClickable( this.driver, publishSelector );
			}
		} );
		return driverHelper.waitTillPresentAndDisplayed( this.driver, publishedSelector );
	}
}
