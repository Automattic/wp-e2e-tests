import { By } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper.js';

import BaseContainer from '../../base-container.js';

export default class DesignTypeChoicePage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.design-type__list' ) );
	}
	selectFirstDesignType() {
		return driverHelper.clickWhenClickable( this.driver, By.css( '.design-type__choice__link' ) );
	}
}
