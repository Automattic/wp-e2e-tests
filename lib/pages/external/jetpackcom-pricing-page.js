/** @format */

import { By } from 'selenium-webdriver';

import AsyncBaseContainer from '../../async-base-container';
import * as driverHelper from '../../driver-helper';

export default class JetpackComPricingPage extends AsyncBaseContainer {
	constructor( driver, url ) {
		if ( ! url ) {
			url = 'https://jetpack.com/pricing/';
		}
		super( driver, By.css( '.plans-pricing-comparison' ), url );
	}

	async buyPremium() {
		const buyPremiumSelector = By.css( '#cta-premium-top' );
		return await driverHelper.clickWhenClickable( this.driver, buyPremiumSelector );
	}
}
