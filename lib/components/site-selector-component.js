import webdriver, { By, until } from 'selenium-webdriver';
import config from 'config';
import * as driverHelper from '../driver-helper.js';

class SiteSelectorComponent {
	constructor( driver ) {
		this.firstSiteSelector = By.xpath( "//div[contains(@class, 'site-selector-modal')]//div[contains(@class, 'site-selector__sites')]/*[1]/a" );
		this.foundComponent = false;
		this.driver = driver;
		this.explicitWaitMS = config.get( 'explicitWaitMS' );
		this.expectedElementSelector = By.className( 'site-selector-modal' );
		this.driver.wait( until.elementLocated( this.expectedElementSelector ), this.explicitWaitMS * 2, 'Could not locate the site selector component.' )
			.then( () => this.foundComponent = true )
	}

	back() {
		return driverHelper.clickWhenClickable( this.driver, By.css( '.dialog button' ), this.explicitWaitMS );
	}

	ok() {
		return driverHelper.clickWhenClickable( this.driver, By.css( '.dialog button.is-primary' ), this.explicitWaitMS );
	}

	selectFirstSite() {
		const d = webdriver.promise.defer();

		driverHelper.clickWhenClickable( this.driver, By.css( '.sites-dropdown' ), this.explicitWaitMS );

		const element = this.driver.findElement( this.firstSiteSelector );
		element.findElement( By.css( '.site__domain' ) ).getText().then( ( domain ) => {
			this.selectedSiteDomain = domain;
			element.click().then( () => d.fulfill( true ) );
		} );

		return d.promise;
	}
}

export default SiteSelectorComponent;
