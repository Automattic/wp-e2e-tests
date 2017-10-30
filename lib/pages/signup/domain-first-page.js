import { By } from 'selenium-webdriver';
import BaseContainer from '../../base-container';
import * as driverHelper from '../../driver-helper';

export default class DomainFirstPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.site-or-domain__choices' ) );
	}

	chooseJustBuyTheDomain() {
		return driverHelper.clickWhenClickable( this.driver, By.css( '.site-or-domain__choice[data-e2e-type="domain"]' ) );
	}
}
