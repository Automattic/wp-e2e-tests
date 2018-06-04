/** @format */

import { By } from 'selenium-webdriver';
import config from 'config';

import BaseContainer from '../../base-container.js';

import * as driverHelper from '../../driver-helper.js';

export default class CheckOutPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.checkout' ), false, null, config.get( 'explicitWaitMS' ) * 2 );
	}

	async enterRegistarDetails( {
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
		await driverHelper.setWhenSettable( this.driver, By.id( 'first-name' ), firstName );
		await driverHelper.setWhenSettable( this.driver, By.id( 'last-name' ), lastName );
		await driverHelper.setWhenSettable( this.driver, By.id( 'email' ), emailAddress );

		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `select.phone-input__country-select option[value="${ countryCode }"]` )
		);

		await driverHelper.setWhenSettable( this.driver, By.css( 'input[name="phone"]' ), phoneNumber );

		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `select[name=country-code] option[value="${ countryCode }"]` )
		);

		await driverHelper.setWhenSettable( this.driver, By.id( 'address-1' ), address );
		await driverHelper.setWhenSettable( this.driver, By.id( 'city' ), city );

		await driverHelper.clickWhenClickable(
			this.driver,
			By.css( `select[name=state] option[value="${ stateCode }"]` )
		);

		return await driverHelper.setWhenSettable( this.driver, By.id( 'postal-code' ), postalCode );
	}

	async selectAddPrivacyProtectionCheckbox() {
		// The radio button _should_ be selected by default, but let's click it anyway :)
		const selector = By.css( 'input#registrantType[value="private"]' );
		return await driverHelper.setCheckbox( this.driver, selector );
	}

	async submitForm() {
		return await driverHelper.clickWhenClickable( this.driver, By.css( 'button[type="submit"]' ) );
	}

	removeItem() {
		return driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.remove-item' ),
			this.explicitWaitMS
		);
	}

	removeAllItems() {
		const selector = By.css( '.remove-item' );
		const driver = this.driver;

		for ( let i = 0; i < 5; i++ ) {
			driverHelper.isElementPresent( driver, selector ).then( function( present ) {
				if ( present ) {
					driver
						.findElement( selector )
						.isDisplayed()
						.then( function( displayed ) {
							if ( displayed === true ) {
								driver.findElement( selector ).click();
							}
						} );
				}
			} );
		}
	}
}
