import webdriver from 'selenium-webdriver';
import config from 'config';
import BaseContainer from '../../base-container';

const by = webdriver.By;

export default class AddProductPage extends BaseContainer {
	constructor( driver, visit = false ) {
		const url = config.get( 'calypsoBaseURL' ) + '/store/products/' + config.get( 'wooCommerceSite' ) + '/add';
		super( driver, by.css( '.woocommerce .products__product-form-details' ), visit, url );
	}
}
