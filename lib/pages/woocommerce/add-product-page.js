import webdriver from 'selenium-webdriver';
import config from 'config';
import BaseContainer from '../../base-container';

import * as driverHelper from '../../../lib/driver-helper';

const by = webdriver.By;

export default class AddProductPage extends BaseContainer {
	constructor( driver, visit = false ) {
		const url = config.get( 'calypsoBaseURL' ) + '/store/products/' + config.get( 'wooCommerceSite' ) + '/add';
		super( driver, by.css( '.woocommerce .products__product-form-details' ), visit, url );
	}

	addImage( fileDetails ) {
		const newFile = fileDetails.file;
		return this.driver.findElement( by.css( 'input[type="file"]' ) ).sendKeys( newFile );
	}

	enterTitle( productTitle ) {
		return driverHelper.setWhenSettable( this.driver, by.css( 'input#name' ), productTitle );
	}

}
