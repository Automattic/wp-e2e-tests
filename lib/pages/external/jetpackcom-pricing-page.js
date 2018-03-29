import { By } from 'selenium-webdriver';

import BaseContainer from '../../base-container';
import * as driverHelper from '../../driver-helper';

export default class JetpackComPricingPage extends BaseContainer {
	constructor( driver ) {
		const url = 'https://jetpack.com/pricing/';
		super( driver, By.css( '.plans-pricing-comparison' ), true, url );
	}

	buyPremium() {
		const buyPremiumSelector = By.css( '#cta-premium-top' );

		return driverHelper.clickWhenClickable( this.driver, buyPremiumSelector );
	}
}
