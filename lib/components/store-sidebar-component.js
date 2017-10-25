import { By } from 'selenium-webdriver';
import * as driverHelper from '../../lib/driver-helper';
import BaseContainer from '../base-container.js';

export default class StoreSidebarComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.store-sidebar__sidebar' ) );
		this.productsLinkSelector = By.css( 'li.products a' );
		this.ordersLinkSelector = By.css( 'li.orders a' );
		this.settingsLinkSelector = By.css( 'li.settings a' );
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

	ordersLinkDisplayed() {
		return driverHelper.isEventuallyPresentAndDisplayed( this.driver, this.ordersLinkSelector );
	}

	selectProducts() {
		return driverHelper.clickWhenClickable( this.driver, this.productsLinkSelector );
	}

	selectOrders() {
		return driverHelper.clickWhenClickable( this.driver, this.ordersLinkSelector );
	}

	addProduct() {
		return driverHelper.clickWhenClickable( this.driver, By.css( 'li.products a.sidebar__button' ) );
	}

	settingsLinkDisplayed() {
		return driverHelper.isEventuallyPresentAndDisplayed( this.driver, this.settingsLinkSelector );
	}

	selectSettings() {
		return driverHelper.clickWhenClickable( this.driver, this.settingsLinkSelector );
	}

}

