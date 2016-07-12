import { By } from 'selenium-webdriver';

import BaseContainer from '../../base-container.js';

import * as driverHelper from '../../driver-helper.js';

export default class CheckOutPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.checkout' ) );
	}

	enterRegistarDetails( firstName, lastName, domainEmailAddress, phoneNumber, countryCode, address, city, stateCode, postalCode ) {
		driverHelper.setWhenSettable( this.driver, By.id( 'first-name' ), firstName );
		driverHelper.setWhenSettable( this.driver, By.id( 'last-name' ), lastName );
		driverHelper.setWhenSettable( this.driver, By.id( 'email' ), domainEmailAddress );
		driverHelper.setWhenSettable( this.driver, By.id( 'phone' ), phoneNumber );

		driverHelper.clickWhenClickable( this.driver, By.css( 'select[name=country-code]' ) );
		driverHelper.clickWhenClickable( this.driver, By.css( `select[name=country-code] option[value="${countryCode}"]` ) );

		driverHelper.setWhenSettable( this.driver, By.id( 'address-1' ), address );
		driverHelper.setWhenSettable( this.driver, By.id( 'city' ), city );

		driverHelper.clickWhenClickable( this.driver, By.css( 'select[name=state]' ) );
		driverHelper.clickWhenClickable( this.driver, By.css( `select[name=state] option[value="${stateCode}"]` ) );

		return driverHelper.setWhenSettable( this.driver, By.id( 'postal-code' ), postalCode );
	}

	selectAddPrivacyProtection() {
		return driverHelper.clickWhenClickable( this.driver, By.css( '.privacy-protection button' ), this.explicitWaitMS );
	}

	selectAddPrivacyProtectionCheckbox() {
		const self = this;
		const selector = By.id( 'privacyProtectionCheckbox' );
		return self.driver.findElement( selector ).getAttribute( 'checked' ).then( function( checked ) {
			if ( ! checked ) {
				return driverHelper.clickWhenClickable( self.driver, selector, self.explicitWaitMS );
			}
		} );
	}

	submitForm() {
		return driverHelper.clickWhenClickable( this.driver, By.css( 'button.checkout__domain-details-form-submit-button.is-primary' ), this.explicitWaitMS );
	}

	removeItem() {
		return driverHelper.clickWhenClickable( this.driver, By.css( '.remove-item' ), this.explicitWaitMS );
	}

	removeAllItems() {
		var selector = By.className( 'remove-item' );
		var driver = this.driver;

		for ( let i = 0; i < 5; i++ ) {
			driver.isElementPresent( selector ).then( function( present ) {
				if ( present ) {
					driver.findElement( selector ).isDisplayed().then( function( displayed ) {
						if ( displayed === true ) {
							driver.findElement( selector ).click();
						}
					} );
				}
			} );
		}
	}
};
