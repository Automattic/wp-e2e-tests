import { By as by, until } from 'selenium-webdriver';
import config from 'config';
import BaseContainer from '../../base-container';

import * as driverHelper from '../../../lib/driver-helper';

export default class AddProductPage extends BaseContainer {
	constructor( driver, visit = false ) {
		const url = config.get( 'calypsoBaseURL' ) + '/store/products/' + config.get( 'wooCommerceSite' ) + '/add';
		super( driver, by.css( '.woocommerce .products__product-form-details' ), visit, url );
	}

	addImage( fileDetails ) {
		const driver = this.driver;
		const newFile = fileDetails.file;
		const uploadButton = by.css( '.file-picker' );
		const inputElement = by.css( 'input[type="file"]' );

		return driverHelper.clickWhenClickable( driver, uploadButton ).then( () => {
			return driver.findElement( inputElement ).sendKeys( newFile );
		} );
	}

	enterTitle( productTitle ) {
		return driverHelper.setWhenSettable( this.driver, by.css( 'input#name' ), productTitle );
	}

	enterDescription( descriptionText ) {
		this.driver.wait( until.ableToSwitchToFrame( by.css( '.mce-edit-area iframe' ) ), this.explicitWaitMS, 'Could not locate the description editor iFrame.' );
		this.driver.findElement( by.css( '#tinymce' ) ).sendKeys( descriptionText );
		return this.driver.switchTo().defaultContent();
	}

	saveAndPublish() {
		return driverHelper.clickWhenClickable( this.driver, by.css( '.action-header__actions button.is-primary' ) );
	}

	waitForSuccessNotice() {
		return driverHelper.waitTillPresentAndDisplayed( this.driver, by.css( '.notice.is-success' ) );
	}

}
