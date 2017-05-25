import webdriver, { By } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper.js';

import BaseContainer from '../base-container.js';

class SiteSelectorComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.site-selector-modal' ) );
		this.firstSiteSelector = By.css( 'div.site-selector-modal div.site-selector__sites a' );
	}

	back() {
		return driverHelper.clickWhenClickable( this.driver, By.css( '.dialog button' ), this.explicitWaitMS );
	}

	ok() {
		return driverHelper.clickWhenClickable( this.driver, By.css( '.dialog .button.is-primary' ), this.explicitWaitMS );
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
