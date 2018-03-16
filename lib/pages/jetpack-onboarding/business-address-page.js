import { By as by } from 'selenium-webdriver';
import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';

export default class BusinessAddressPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.jetpack-onboarding' ) );
	}

	selectAddBusinessAddress( ) {
		return driverHelper.clickWhenClickable( this.driver, by.css( 'a.card[data-e2e-type="business-address"] button' ) );
	}

	selectContinue( ) {
		const continueSelector = by.css( 'a.card[data-e2e-type="continue"] button' );
		return driverHelper.waitTillPresentAndDisplayed( this.driver, continueSelector )
			.then( () => driverHelper.clickWhenClickable( this.driver, continueSelector ) );
	}

	enterBusinessAddressAndSubmit( name, street, city, state, zip, country ) {
		return driverHelper.waitTillPresentAndDisplayed( this.driver, by.css( '#name' ), 30000 )
			.then( () => {
				driverHelper.setWhenSettable( this.driver, by.css( '#name' ), name, );
				driverHelper.setWhenSettable( this.driver, by.css( '#street' ), street );
				driverHelper.setWhenSettable( this.driver, by.css( '#city' ), city );
				driverHelper.setWhenSettable( this.driver, by.css( '#state' ), state );
				driverHelper.setWhenSettable( this.driver, by.css( '#zip' ), zip );
				driverHelper.setWhenSettable( this.driver, by.css( '#country' ), country );
				driverHelper.clickWhenClickable( this.driver, by.css( 'button.is-primary' ) );
			} );
	}
}
