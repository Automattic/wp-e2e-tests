import webdriver from 'selenium-webdriver';
import config from 'config';
import BaseContainer from '../../base-container.js';

const by = webdriver.By;

export default class StoreDashboardPage extends BaseContainer {
	constructor( driver, visit = false ) {
		const url = config.get( 'calypsoBaseURL' ) + '/store/' + config.get( 'wooCommerceSite' );
		super( driver, by.css( '.woocommerce .dashboard.main' ), visit, url );
	}
}
