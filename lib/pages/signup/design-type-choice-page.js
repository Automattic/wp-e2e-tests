import { By } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper.js';
import * as driverManager from '../../driver-manager.js';

import BaseContainer from '../../base-container.js';

export default class DesignTypeChoicePage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.design-type__list,.design-type-with-store__list,.design-type-with-atomic-store__list' ) );
	}

	selectFirstDesignType() {
		const locale = driverManager.currentLocale();
		if ( locale !== 'en' ) {
			return driverHelper.clickWhenClickable( this.driver, By.css( '.design-type__choice.is-card-link' ) );
		}
		return driverHelper.clickWhenClickable( this.driver, By.css( '.design-type__choice__link,.design-type-with-store__choice-link,.design-type-with-atomic-store__choice-link' ) );
	}

	selectStore() {
		return driverHelper.clickWhenClickable( this.driver, By.css( 'img[src*="type-e-commerce"]' ) );
	}
}
