/** @format */

import { By } from 'selenium-webdriver';

import * as driverHelper from '../driver-helper';
import AsyncBaseContainer from '../async-base-container';

export default class EnterADomainComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.map-domain-step__add-domain' ) );
	}

	async enterADomain( blogName ) {
		return await driverHelper.setWhenSettable(
			this.driver,
			By.css( '.map-domain-step__external-domain' ),
			blogName
		);
	}

	async clickonAddButtonToAddDomainToTheCart() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.map-domain-step__go.button.is-primary' )
		);
	}

	async isComMaintenanceActive() {
		try {
			let errorMessage = await driverHelper.getInfoMessageIfPresent( this.driver );
			if ( errorMessage.includes( 'Domains ending with .com are undergoing maintenance.' ) ) {
				return true;
			}
		} catch ( e ) {}
	}
}
