import { By } from 'selenium-webdriver';

import BaseContainer from '../../base-container.js';

import * as driverHelper from '../../driver-helper';

export default class WizardSetupPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( 'div.wc-setup-content form.address-step' ) );
	}

	enterStoreDetailsAndSubmit( { countryStateCode, address, address2, city, postalCode, currency, productType, inPerson = false, helpWoo = false } ) {
		const countryStateContainerSelector = By.id( 'select2-store_country_state-container' );
		const countryStateSelector = By.css( `li[id$="${countryStateCode}"]` );
		const addressSelector = By.id( 'store_address' );
		const address2Selector = By.id( 'store_address_2' );
		const citySelector = By.id( 'store_city' );
		const postcodeSelector = By.id( 'store_postcode' );
		const currencyContainerSelector = By.id( 'select2-currency_code-container' );
		const currencySelector = By.css( `li[id$="${currency}"]` );
		const productTypeContainerSelector = By.id( 'select2-product_type-container' );
		const productTypeSelector = By.css( `li[id$="${productType}"]` );
		const inPersonSelector = By.id( 'woocommerce_sell_in_person' );
		const helpWooSelector = By.css( 'p.checkbox' );
		const submitButtonSelector = By.css( 'button[name="save_step"]' );

		driverHelper.clickWhenClickable( this.driver, countryStateContainerSelector );
		driverHelper.clickWhenClickable( this.driver, countryStateSelector );
		driverHelper.setWhenSettable( this.driver, addressSelector, address );
		driverHelper.setWhenSettable( this.driver, address2Selector, address2 );
		driverHelper.setWhenSettable( this.driver, citySelector, city );
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

		if ( !helpWoo ) {
			driverHelper.clickWhenClickable( this.driver, helpWooSelector );
		}

		return driverHelper.clickWhenClickable( this.driver, submitButtonSelector );
	}

}
