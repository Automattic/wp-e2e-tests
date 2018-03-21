/** @format */

import { By } from 'selenium-webdriver';
import config from 'config';

import BaseContainer from '../../base-container.js';

import * as driverHelper from '../../driver-helper.js';

export default class CheckOutPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.checkout' ), false, null, config.get( 'explicitWaitMS' ) * 2 );
	}

	enterRegistarDetails( {
		firstName,
		lastName,
		emailAddress,
		phoneNumber,
		countryCode,
		address,
		city,
		stateCode,
		postalCode,
	} ) {
		driverHelper.setWhenSettable( this.driver, By.id( 'first-name' ), firstName );
		driverHelper.setWhenSettable( this.driver, By.id( 'last-name' ), lastName );
		driverHelper.setWhenSettable( this.driver, By.id( 'email' ), emailAddress );

		driverHelper.clickWhenClickable(
			this.driver,
			By.css( `select.phone-input__country-select option[value="${ countryCode }"]` )
		);

		driverHelper.setWhenSettable( this.driver, By.css( 'input[name="phone"]' ), phoneNumber );

		driverHelper.clickWhenClickable(
			this.driver,
			By.css( `select[name=country-code] option[value="${ countryCode }"]` )
		);

		driverHelper.setWhenSettable( this.driver, By.id( 'address-1' ), address );
		driverHelper.setWhenSettable( this.driver, By.id( 'city' ), city );

		driverHelper.clickWhenClickable(
			this.driver,
			By.css( `select[name=state] option[value="${ stateCode }"]` )
		);

		return driverHelper.setWhenSettable( this.driver, By.id( 'postal-code' ), postalCode );
	}

	selectAddPrivacyProtectionCheckbox() {
		// The radio button _should_ be selected by default, but let's click it anyway :)
		const selector = By.css( 'input#registrantType[value="private"]' );
		return driverHelper.setCheckbox( this.driver, selector );
	}

	submitForm() {
		return driverHelper.clickWhenClickable( this.driver, By.css( 'button[type="submit"]' ) );
	}

	removeItem() {
		return driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.remove-item' )
		);
	}

	removeAllItems() {
		const selector = By.css( '.remove-item' );

		for ( let i = 0; i < 5; i++ ) {
			driverHelper.clickIfPresent( this.driver, selector );
		}
	}
}
