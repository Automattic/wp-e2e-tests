import { By as by } from 'selenium-webdriver';
import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';

export default class WPAdminSettingsSharingPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '#publicize-form' ) );
	}

	addTwitterConnection() {
		this._addService( 'twitter' );
	}

	addTumblrConnection() {
		this._addService( 'tumblr' );
	}

	removeTwitterIfExists() {
		this._removeService( 'twitter' );
	}

	removeTumblrIfExists() {
		this._removeService( 'tumblr' );
	}

	twitterAccountShown( twitterUserName ) {
		const selector = by.css( `.publicize-profile-link[href="https://twitter.com/${twitterUserName}"]` );
		return driverHelper.isEventuallyPresentAndDisplayed( this.driver, selector );
	}

	tumblrBlogShown( tumblrBlogName ) {
		const selector = by.css( `.publicize-profile-link[href="http://${tumblrBlogName}.tumblr.com/"]` );
		return driverHelper.isEventuallyPresentAndDisplayed( this.driver, selector );
	}

	facebookPageShown( facebookPageName ) {
		const selector = by.css( `.publicize-profile-link[href="https://www.facebook.com/${facebookPageName.toLowerCase()}/"]` );
		return driverHelper.isEventuallyPresentAndDisplayed( this.driver, selector );
	}

	availableSharingButtons() {
		return this.driver.findElements( by.css( '#available-services .service' ) );
	}

	enabledSharingButtons() {
		return this.driver.findElements( by.css( '#enabled-services .service' ) );
	}

	previewedSharingButtons() {
		return this.driver.findElements( by.css( '#live-preview .preview .preview-item' ) );
	}

	showButtonsOnFrontPage() {
		this._enableButtonCheckbox( 'index' );
	}

	showButtonsOnPosts() {
		this._enableButtonCheckbox( 'post' );
	}

	showButtonsOnPages() {
		this._enableButtonCheckbox( 'page' );
	}

	showButtonsOnMedia() {
		this._enableButtonCheckbox( 'attachment' );
	}

	saveChanges() {
		driverHelper.clickWhenClickable( this.driver, by.css( 'p.submit input[type="submit"]' ) );
		return driverHelper.waitTillPresentAndDisplayed( this.driver, by.css( '.updated' ) );
	}

	setButtonStyleToIconAndText() {
		driverHelper.clickWhenClickable( this.driver, by.css( 'select#button_style' ) );
		return driverHelper.clickWhenClickable( this.driver, by.css( 'select#button_style option[value="icon-text"]' ) );
	}

	sharingActivated( name ) {
		const selector = by.css( `#enabled-services .share-${name}` );
		return driverHelper.isEventuallyPresentAndDisplayed( this.driver, selector );
	}

	sharingPreviewIncludes( name ) {
		const selector = by.css( `#live-preview ul.preview .share-${name}` );
		return driverHelper.isEventuallyPresentAndDisplayed( this.driver, selector );
	}

	_enableButtonCheckbox( type ) {
		const self = this;
		const checkBoxSelector = by.css( `input[type="checkbox"][value="${type}"]` );
		self.driver.findElement( checkBoxSelector ).then( ( checkbox ) => {
			checkbox.getAttribute( 'checked' ).then( ( checked ) => {
				console.log( checked );
				if ( checked !== 'true' ) {
					return driverHelper.clickWhenClickable( self.driver, checkBoxSelector );
				}
			} );
		} );
	}

	_addService( serviceName ) {
		const self = this;
		const addServiceButtonSelector = by.css( `a.publicize-add-connection[href*="service=${serviceName}"]` );
		return driverHelper.clickWhenClickable( self.driver, addServiceButtonSelector );
	}

	_removeService( serviceName ) {
		const self = this;
		const removeServiceSelector = by.css( `a[title="Disconnect"][href*="service=${serviceName}"]` );
		return self.driver.isElementPresent( removeServiceSelector ).then( ( elementIsPresent ) => {
			if ( elementIsPresent ) {
				return self.driver.findElements( removeServiceSelector ).then( ( elements ) => {
					if ( elements.length > 1 ) {
						throw new Error( `There are more than 1 ${serviceName} accounts configured - this function can only remove one!` );
					}
					driverHelper.clickWhenClickable( self.driver, removeServiceSelector );
					self.driver.switchTo().alert().then( function( alert ) {
						alert.accept();
					} );
					return driverHelper.waitTillPresentAndDisplayed( self.driver, by.css( 'div.updated' ) );
				} );
			}
		} );
	}
}
