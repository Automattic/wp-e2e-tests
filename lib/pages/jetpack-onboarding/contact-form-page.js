import { By as by} from 'selenium-webdriver';
import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';

export default class ContactFormPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.jetpack-onboarding' ) );
	}

	selectAddContactForm( ) {
		return driverHelper.clickWhenClickable( this.driver, by.css( '.card[data-e2e-type="contact-form"] button' ) );
	}

	selectContinue( ) {
		const continueSelector = by.css( '.card[data-e2e-type="continue"] button' );
		return driverHelper.waitTillPresentAndDisplayed( this.driver, continueSelector )
			.then( () => driverHelper.clickWhenClickable( this.driver, continueSelector ) );
	}
}
