import webdriver from 'selenium-webdriver';
import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

const by = webdriver.By;

export class GetDotBlogHomePage extends BaseContainer {
	constructor( driver, { visit = false, culture = 'en' } = {} ) {
		super( driver, by.css( 'body' ), visit, `https://get.blog/${culture}` );
	}

	searchForDomain( blogName ) {
		let searchInputSelector = by.css( '.app-components-ui-sunrise-home-field input' );
		let searchButton = by.className( 'app-components-ui-button-button' );

		driverHelper.setWhenSettable( this.driver, searchInputSelector, blogName );
		driverHelper.clickWhenClickable( this.driver, searchButton );
	}
}

export class GetDotBlogSearchResults extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.app-components-ui-search-search' ) );
	}

	selectFirstResult() {
		return driverHelper.clickWhenClickable( this.driver, by.css( '.app-components-ui-search-suggestion:first-of-type' ) );
	}
}

export class GetDotBlogEmailInfo extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '#email' ) );
	}

	submitEmail( emailAddress ) {
		let emailInputSelector = by.css( '#email' );
		let submitButton = by.className( 'app-components-ui-button-button' );

		driverHelper.setWhenSettable( this.driver, emailInputSelector, emailAddress );
		driverHelper.clickWhenClickable( this.driver, submitButton );
	}
}

export class GetDotBlogConfirmEmail extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.app-components-ui-connect-user-verify-user-check-email' ) );
	}

	clickUseConfirmationCode() {
		let useCodeLink = by.className( 'app-components-ui-connect-user-verify-user-confirmation-code-link' );

		return driverHelper.clickWhenClickable( this.driver, useCodeLink );
	}
}

export class GetDotBlogContactForm extends BaseContainer {
	constructor( driver ) {
		super( driver, by.id( 'firstName' ) );
	}

	inputDetails( personalInfo ) {
		driverHelper.setWhenSettable( this.driver, by.id( 'firstName' ), personalInfo.firstName );
		driverHelper.setWhenSettable( this.driver, by.id( 'lastName' ), personalInfo.lastName );
		driverHelper.setWhenSettable( this.driver, by.id( 'address1' ), personalInfo.address );
		driverHelper.setWhenSettable( this.driver, by.id( 'city' ), personalInfo.city );
		driverHelper.setWhenSettable( this.driver, by.id( 'postalCode' ), personalInfo.postalCode );
		driverHelper.setWhenSettable( this.driver, by.id( 'phone' ), personalInfo.phoneNumber );

		// Country/State are being difficult, so we click the options and then override via Javascript to ensure it takes
		driverHelper.clickWhenClickable( this.driver, by.css( 'select.app-components-ui-contact-information-country-code' ) );
		driverHelper.clickWhenClickable( this.driver, by.css( `select.app-components-ui-contact-information-country-code option[value="${personalInfo.countryCode}"]` ) );
		this.driver.executeScript( `document.querySelector('select.app-components-ui-contact-information-country-code').value = '${personalInfo.countryCode}'` );

		this.driver.sleep( 1000 );

		driverHelper.clickWhenClickable( this.driver, by.css( '.app-components-ui-contact-information-state select' ) );
		driverHelper.clickWhenClickable( this.driver, by.css( `.app-components-ui-contact-information-state select option[value="${personalInfo.stateCode}"]` ) );
		this.driver.executeScript( `document.querySelector('.app-components-ui-contact-information-state select').value = '${personalInfo.stateCode}'` );

		this.driver.sleep( 1000 );

		driverHelper.clickWhenClickable( this.driver, by.css( '.app-components-ui-button-button' ) );
	}
}
