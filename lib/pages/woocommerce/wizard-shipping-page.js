import { By } from 'selenium-webdriver';

import BaseContainer from '../../base-container.js';

import * as driverHelper from '../../driver-helper';

export default class WizardShippingPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( 'div.wc-setup-content ul.shipping' ) );
	}

	setFlatRateAndContinue( { domesticRate, internationalRate } ) {
		const domesticRateSelector = By.id( 'shipping_zones[domestic][flat_rate][cost]' );
		const internationalRateSelector = By.id( 'shipping_zones[intl][flat_rate][cost]' );
		const continueButtonSelector = By.css( 'By.css( \'button.button-next\' )' );
		driverHelper.setWhenSettable( this.driver, domesticRateSelector, domesticRate );
		driverHelper.setWhenSettable( this.driver, internationalRateSelector, internationalRate );
		return driverHelper.clickWhenClickable( this.driver, continueButtonSelector );
	}

	selectContinue() {
		const continueButtonSelector = By.css( 'button.button-next' );
		return driverHelper.clickWhenClickable( this.driver, continueButtonSelector );
	}

}
