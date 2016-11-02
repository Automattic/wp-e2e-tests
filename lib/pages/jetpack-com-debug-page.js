import webdriver from 'selenium-webdriver';
import BaseContainer from '../base-container.js';

const by = webdriver.By;

export default class JetpackDotComDebugPage extends BaseContainer {
	constructor( driver, { visit = false, jetpackSiteUrl = '' } = {} ) {
		super( driver, by.css( '.single-jetpack_support' ), visit, `https://jetpack.com/support/debug/?url=${jetpackSiteUrl}` );
	}

	status() {
		return this.driver.findElement( by.css( '#site-debugger h2' ) ).getText();
	}
}
