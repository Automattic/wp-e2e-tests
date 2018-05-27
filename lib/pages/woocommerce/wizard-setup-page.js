/** @format */

import { By } from 'selenium-webdriver';

import BaseContainer from '../../base-container.js';

import * as driverHelper from '../../driver-helper';

export default class WizardSetupPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( 'div.wc-setup-content form.address-step' ) );
	}

	enterStoreDetailsAndSubmit( {
		countryCode,
		stateCode,
		address,
		address2,
		city,
		postalCode,
		currency,
		productType,
		inPerson = false,
		helpWoo = false,
	} ) {
		const countryContainerSelector = By.id( 'select2-store_country-container' );
		const countrySelector = By.css( `li[id$="${ countryCode }"]` );
		const addressSelector = By.id( 'store_address' );
		const address2Selector = By.id( 'store_address_2' );
		const citySelector = By.id( 'store_city' );
		const stateContainerSelector = By.id( 'select2-store_state-container' );
		const stateSelector = By.css( `li[id$="${ stateCode }"]` );
		const postcodeSelector = By.id( 'store_postcode' );
		const currencyContainerSelector = By.id( 'select2-currency_code-container' );
		const currencySelector = By.css( `li[id$="${ currency }"]` );
		const productTypeContainerSelector = By.id( 'select2-product_type-container' );
		const productTypeSelector = By.css( `li[id$="${ productType }"]` );
		const inPersonSelector = By.id( 'woocommerce_sell_in_person' );
		const helpWooSelector = By.css( 'p.checkbox' );
		const submitButtonSelector = By.css( 'button[name="save_step"]' );

		driverHelper.clickWhenClickable( this.driver, countryContainerSelector );
		driverHelper.clickWhenClickable( this.driver, countrySelector );
		driverHelper.setWhenSettable( this.driver, addressSelector, address );
		driverHelper.setWhenSettable( this.driver, address2Selector, address2 );
		driverHelper.setWhenSettable( this.driver, citySelector, city );
		driverHelper.clickWhenClickable( this.driver, stateContainerSelector );
		driverHelper.clickWhenClickable( this.driver, stateSelector );
		driverHelper.setWhenSettable( this.driver, postcodeSelector, postalCode );
		driverHelper.clickWhenClickable( this.driver, currencyContainerSelector );
		driverHelper.clickWhenClickable( this.driver, currencySelector );
		driverHelper.clickWhenClickable( this.driver, productTypeContainerSelector );
		driverHelper.clickWhenClickable( this.driver, productTypeSelector );

		if ( inPerson ) {
			driverHelper.setCheckbox( this.driver, inPersonSelector );
		} else {
			driverHelper.unsetCheckbox( this.driver, inPersonSelector );
		}

		if ( ! helpWoo ) {
			driverHelper.clickWhenClickable( this.driver, helpWooSelector );
		}

		return driverHelper.clickWhenClickable( this.driver, submitButtonSelector );
	}
}
