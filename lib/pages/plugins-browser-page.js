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
		return driverHelper.setWhenSettable( this.driver, by.css( '.plugins-browser__main-header input[type="search"]' ), searchTerm );
	}

	pluginTitledShown( pluginTitle ) {
		const self = this;
		const selector = by.xpath( `//div[@class="plugins-browser-item__title"][text()="${pluginTitle}"]` );
		return driverHelper.isEventuallyPresentAndDisplayed( self.driver, selector ).then( ( shown ) => {
			if ( shown === true ) {
				return shown;
			} else {
				SlackNotifier.warn( 'The Jetpack Plugins Browser results were not showing expected result, so refreshing and trying again' );
				self.driver.navigate().refresh();
				return driverHelper.isEventuallyPresentAndDisplayed( self.driver, selector );
			}
		} );
	}
}
