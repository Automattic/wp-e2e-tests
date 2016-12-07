import BaseContainerMobile from '../../base-container-mobile.js';
import * as webdriver from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper.js';
const By = webdriver.By;

export default class NavbarComponent extends BaseContainerMobile {
	constructor( driver ) {
		super( driver, By.xpath( '//XCUIElementTypeTabBar[@name="Main Navigation"]' ) );
	}

	getCurrentTab() {
		const selector = By.xpath( '//XCUIElementTypeTabBar[@name="Main Navigation"]/XCUIElementTypeButton[@value=1]' );
		return this.driver.findElement( selector ).then( function( el ) {
			return el.name;
		} );
	}

	openTab( requestedTab ) {
		var self = this;
		var d = webdriver.promise.defer();

		this.getCurrentTab().then( function( currTab ) {
			if ( currTab !== requestedTab ) {
				const selector = By.xpath( `//XCUIElementTypeButton[@name="${requestedTab}"]` );
				driverHelper.clickWhenClickableMobile( self.driver, selector ).then( function() {
					d.fulfill();
				} );
			}
		} );

		return d.promise;
	}
}
