import webdriver from 'selenium-webdriver';
import BaseContainer from '../../base-container.js';

const by = webdriver.By;

export default class DevdocsPage extends BaseContainer {
	constructor( driver, visit ) {
		super( driver, by.css( '.notice' ), visit, 'https://wpcalypso.wordpress.com/devdocs/design/notices', false );
	}
}
