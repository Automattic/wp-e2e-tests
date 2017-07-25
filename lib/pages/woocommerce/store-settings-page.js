import webdriver from 'selenium-webdriver';
import config from 'config';
import BaseContainer from '../../base-container.js';

const by = webdriver.By;

export default class StoreSettingsPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.woocommerce .settingsPayments' ) );
	}
}
