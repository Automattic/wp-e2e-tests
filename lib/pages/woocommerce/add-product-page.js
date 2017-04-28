import webdriver from 'selenium-webdriver';
import config from 'config';
import BaseContainer from '../../base-container';
import * as driverHelper from '../../driver-helper';

const by = webdriver.By;

export default class AddProductPage extends BaseContainer {
	constructor( driver, visit = false ) {
		const url = config.get( 'calypsoBaseURL' ) + '/store';
		super( driver, by.css( '.woocommerce' ), visit, url );
		if ( visit === true ) {
			driver.getCurrentUrl().then( ( url ) => {
				driver.get( url + '/products/add' );
			} );
		}
		driverHelper.waitTillPresentAndDisplayed( driver, by.css( '.woocommerce.products__form' ) );
	}
}
