import webdriver from 'selenium-webdriver';
import BaseContainer from '../base-container';
import * as SlackNotifier from '../slack-notifier';
import * as driverHelper from '../driver-helper';

const by = webdriver.By;

export default class PluginsBrowserPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.plugins-browser__main-header' ) );
	}

	searchForPlugin( searchTerm ) {
		driverHelper.clickWhenClickable( this.driver, by.css( 'div.search' ) );
		return driverHelper.setWhenSettable( this.driver, by.css( '.plugins-browser__main-header input[type="search"]' ), searchTerm, { pauseBetweenKeysMS: 100 } );
	}

	pluginTitledShown( pluginTitle, searchTerm ) {
		const self = this;
		const selector = by.xpath( `//div[@class="plugins-browser-item__title"][text()="${pluginTitle}"]` );
		return driverHelper.isEventuallyPresentAndDisplayed( self.driver, selector ).then( ( shown ) => {
			if ( shown === true ) {
				return shown;
			}
			SlackNotifier.warn( 'The Jetpack Plugins Browser results were not showing the expected result, so trying again' );
			driverHelper.clickWhenClickable( self.driver, by.css( '.search__close-icon' ) );
			self.searchForPlugin( searchTerm );
			return driverHelper.isEventuallyPresentAndDisplayed( self.driver, selector );
		} );
	}
}
