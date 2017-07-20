import webdriver from 'selenium-webdriver';
import config from 'config';
import BaseContainer from '../../base-container.js';
import * as driverHelper from '../../../lib/driver-helper';

const by = webdriver.By;

export default class StoreProductsPage extends BaseContainer {
	constructor( driver, visit = false ) {
		const url = config.get( 'calypsoBaseURL' ) + '/store/products/' + config.get( 'wooCommerceSite' );
		super( driver, by.css( '.products__list' ), visit, url );
	}

	atLeastOneProductDisplayed() {
		return driverHelper.isEventuallyPresentAndDisplayed( this.driver, by.css( '.products__list-wrapper tr.has-action' ) );
	}

	productDisplayed( productTitle ) {
		return driverHelper.isEventuallyPresentAndDisplayed( this.driver, by.xpath( `//span[text()='${productTitle}']` ) );
	}
}
