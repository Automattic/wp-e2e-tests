import { By } from 'selenium-webdriver';
import * as driverHelper from '../../lib/driver-helper';
import BaseContainer from '../base-container.js';

export default class StoreSidebarComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.store-sidebar__sidebar' ) );
		this.productsLinkSelector = By.css( 'li.products a' );
		this.displayComponentIfNecessary();
	}

	// this is necessary on mobile width screens
	displayComponentIfNecessary() {
		const driver = this.driver;
		const mobileLeftArrowSelector = By.css( '.current-section a' );
		driver.findElement( mobileLeftArrowSelector ).isDisplayed().then( ( displayed ) => {
			if ( displayed === true ) {
				driverHelper.clickWhenClickable( driver, mobileLeftArrowSelector );
			}
		} );
	}

	productsLinkDisplayed() {
		return driverHelper.isEventuallyPresentAndDisplayed( this.driver, this.productsLinkSelector );
	}

	selectProducts() {
		return driverHelper.clickWhenClickable( this.driver, this.productsLinkSelector );
	}

}

