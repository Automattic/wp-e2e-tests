import { By } from 'selenium-webdriver';
import * as driverHelper from '../../lib/driver-helper';
import BaseContainer from '../base-container.js';

export default class StoreSidebarComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.store-sidebar__sidebar' ) );
		this.productsLinkSelector = By.css( 'li.products a' );
	}

	productsLinkDisplayed() {
		return driverHelper.isEventuallyPresentAndDisplayed( this.driver, this.productsLinkSelector );
	}

	selectProducts() {
		return driverHelper.clickWhenClickable( this.driver, this.productsLinkSelector );
	}

}

