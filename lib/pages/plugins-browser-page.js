import webdriver from 'selenium-webdriver';
import config from 'config';
import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

const by = webdriver.By;

export default class PluginsBrowserPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.plugins-browser__main-header' ) );
	}

	searchForPlugin( searchTerm ) {
		return driverHelper.setWhenSettable( this.driver, by.css( '.plugins-browser__main-header input[type="search"]' ), searchTerm );
	}

	pluginTitledShown( pluginTitle ) {
		const longExplicitWaitMS = config.get( 'explicitWaitMS' ) * 2;
		const selector = by.xpath( `//div[@class="plugins-browser-item__title"][text()="${pluginTitle}"]` );
		return driverHelper.waitTillPresentAndDisplayed( this.driver, selector, longExplicitWaitMS );
	}
}
