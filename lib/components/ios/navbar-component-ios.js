import BaseContainerMobile from '../../base-container-mobile.js';
import * as webdriver from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper.js';
const By = webdriver.By;

export default class NavbarComponent extends BaseContainerMobile {
	constructor( driver ) {
		super( driver, By.xpath( '//UIATabBar[@name="Main Navigation"]' ) );
	}

	getCurrentTab() {
		const selector = By.xpath( '//UIAApplication[1]/UIAWindow[1]/UIANavigationBar[1]' );
		return this.driver.findElement( selector ).then( function( el ) {
			return el.name;
		} );
	}

	openTab( requestedTab ) {
		var self = this;
		var d = webdriver.promise.defer();

		this.getCurrentTab().then( function( currTab ) {
			if ( currTab !== requestedTab ) {
				const selector = By.xpath( `//UIAButton[@name="${requestedTab}"]` );
				driverHelper.clickWhenClickableMobile( self.driver, selector ).then( function() {
					d.fulfill();
				} );
			}
		} );

		return d.promise;
	}
}
