/** @format */

import { By } from 'selenium-webdriver';

import AsyncBaseContainer from '../async-base-container';
import * as driverHelper from '../driver-helper';

export default class TransferDomainPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.transfer-domain-step__form' ) );
	}

	async enterADomain( domain ) {
		return await driverHelper.setWhenSettable(
			this.driver,
			By.css( '.transfer-domain-step__add-domain input.form-text-input' ),
			domain
		);
	}

	async clickTransferDomain() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.transfer-domain-step__go.is-primary' )
		);
	}

	async isComMaintenanceActive() {
		try {
			let errorMessage = await driverHelper.getInfoMessageIfPresent( this.driver );
			if ( errorMessage.includes( 'Domains ending with .com are undergoing maintenance.' ) ) {
				return true;
			}
		} catch ( e ) {
			return console.log( 'Maintenance is not active.' );
		}
	}
}
