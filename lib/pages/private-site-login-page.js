import webdriver from 'selenium-webdriver';

import BaseContainer from '../base-container.js';

const by = webdriver.By;

export default class PrivateSiteLoginPage extends BaseContainer {
	constructor( driver, visit = false, url = null ) {
		super( driver, by.css( '.private-login' ), visit, url );
	}
}
