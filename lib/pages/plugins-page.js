import webdriver from 'selenium-webdriver';
import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

const by = webdriver.By;

export default class PluginsPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.className( 'plugins-list' ) );
		this.successNoticeSelector = by.css( '.notice.is-success' );
	}

	viewPlugin( pluginSlug ) {
		const pluginSelector = by.css( `a.plugin-item__link[data-reactid*=${pluginSlug}]` );
		return driverHelper.clickWhenClickable( this.driver, pluginSelector );
	}
}
