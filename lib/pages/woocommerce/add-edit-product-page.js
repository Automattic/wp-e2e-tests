/** @format */

import { By as by, until } from 'selenium-webdriver';
import config from 'config';
import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';
import * as driverManager from '../../driver-manager';
import * as dataHelper from '../../data-helper';

export default class AddEditProductPage extends BaseContainer {
	constructor( driver, visit = false ) {
		const url =
			dataHelper.configGet( 'calypsoBaseURL' ) +
			'/store/products/' +
			config.get( 'wooCommerceSite' ) +
			'/add';
		super( driver, by.css( '.woocommerce .products__product-form-details' ), visit, url );
	}

	addImage( fileDetails ) {
		const newFile = fileDetails.file;
		return this.driver.findElement( by.css( 'input[type="file"]' ) ).sendKeys( newFile );
	}

	enterTitle( productTitle ) {
		return driverHelper.setWhenSettable( this.driver, by.css( 'input#name' ), productTitle );
	}

	enterDescription( descriptionText ) {
		this.driver.wait(
			until.ableToSwitchToFrame( by.css( '.mce-edit-area iframe' ) ),
			this.explicitWaitMS,
			'Could not locate the description editor iFrame.'
		);
		this.driver.findElement( by.css( '#tinymce' ) ).sendKeys( descriptionText );
		return this.driver.switchTo().defaultContent();
	}

	addCategory( categoryName ) {
		return driverHelper.setWhenSettable(
			this.driver,
			by.css( '.products__categories-card input.token-field__input' ),
			categoryName
		);
	}

	setPrice( price ) {
		return driverHelper.setWhenSettable(
			this.driver,
			by.css( '.products__product-form-price input[name="price"]' ),
			price
		);
	}

	setDimensions( length, width, height ) {
		driverHelper.setWhenSettable(
			this.driver,
			this._dimentionSelector( 'length' ),
			length
		);
		driverHelper.setWhenSettable(
			this.driver,
			this._dimentionSelector( 'width' ),
			width
		);
		return driverHelper.setWhenSettable(
			this.driver,
			this._dimentionSelector( 'height' ),
			height
		);
	}

	_dimentionSelector( dim ) {
		return by.css( `.products__product-dimensions-input input[name="${ dim }"]` );
	}

	setWeight( weight ) {
		return driverHelper.setWhenSettable(
			this.driver,
			by.css( '.products__product-weight-input input[name="weight"]' ),
			weight
		);
	}

	addQuantity( quantity ) {
		return driverHelper.setWhenSettable(
			this.driver,
			by.css( '.products__product-manage-stock input[name="stock_quantity"]' ),
			quantity
		);
	}

	allowBackorders() {
		return driverHelper.clickWhenClickable(
			this.driver,
			by.css( 'select[name="backorders"] option[value="yes"]' )
		);
	}

	saveAndPublish() {
		// on the mobile page the button isn't clickable
		// see: https://github.com/Automattic/wp-e2e-tests/issues/639
		return this.driver
			.findElement( by.css( '.action-header__actions button.is-primary' ) )
			.then( webElement => this.driver.executeScript( 'return arguments[0].click();', webElement ) );
	}

	waitForSuccessNotice() {
		return driverHelper.waitTillPresentAndDisplayed( this.driver, by.css( '.notice.is-success' ) );
	}

	deleteProduct() {
		if ( driverManager.currentScreenSize() === 'mobile' ) {
			// open the menu on mobile screens
			driverHelper.clickWhenClickable( this.driver, by.css( 'button.split-button__toggle' ) );
			driverHelper.clickWhenClickable( this.driver, by.css( '.popover__menu-item.is-scary' ) );
		} else {
			driverHelper.clickWhenClickable(
				this.driver,
				by.css( '.action-header__actions button.is-scary' )
			);
		}
		driverHelper.clickWhenClickable(
			this.driver,
			by.css( '.dialog__action-buttons button[data-e2e-button="accept"]' )
		);
	}
}
