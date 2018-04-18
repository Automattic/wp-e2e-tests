/** @format */

import { By } from 'selenium-webdriver';

import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';

export default class BusinessAddressPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.jetpack-onboarding' ) );
	}

	selectAddBusinessAddress() {
		return driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.card[data-e2e-type="business-address"] button' )
		);
	}

	selectContinue() {
		const continueSelector = By.css( '.card[data-e2e-type="continue"] button' );
		return driverHelper
			.waitTillPresentAndDisplayed( this.driver, continueSelector )
			.then( () => driverHelper.clickWhenClickable( this.driver, continueSelector ) );
	}

	enterBusinessAddressAndSubmit( name, street, city, state, zip, country ) {
		return driverHelper.waitTillPresentAndDisplayed( this.driver, By.css( '#name' ) ).then( () => {
			driverHelper.setWhenSettable( this.driver, By.css( '#name' ), name );
			driverHelper.setWhenSettable( this.driver, By.css( '#street' ), street );
			driverHelper.setWhenSettable( this.driver, By.css( '#city' ), city );
			driverHelper.setWhenSettable( this.driver, By.css( '#state' ), state );
			driverHelper.setWhenSettable( this.driver, By.css( '#zip' ), zip );
			driverHelper.setWhenSettable( this.driver, By.css( '#country' ), country );
			driverHelper.clickWhenClickable( this.driver, By.css( 'button.is-primary' ) );
		} );
	}
}
