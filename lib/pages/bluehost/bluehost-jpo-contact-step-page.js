import { By as by } from 'selenium-webdriver';
import config from 'config';
import BaseContainer from '../../base-container';
import * as driverHelper from '../../driver-helper';

const getUrl = () => {
	const urlBase = config.get( 'bluehostTestDomain' );
	return `${urlBase}/wp-admin/#welcome/steps/contact-page`;
};

const getContactPageSelector = () => {
	return by.css( 'p.welcome__contact-build--callout' );
}

export default class BluehostJPOContactStepPage extends BaseContainer {
	constructor( driver, visit = false ) {
		super( driver, getContactPageSelector(), visit, getUrl() );
	}

	clickYesButton() {
		return driverHelper.clickWhenClickable( this.driver, this.getYesButton() );
	}

	clickNoButton() {
		return driverHelper.clickWhenClickable( this.driver, this.getNoButton() );
	}

	revisitContactPageStep() {
		this.driver.get( getUrl() );
		return driverHelper.waitTillPresentAndDisplayed( this.driver, getContactPageSelector() );
	}

	/*
	 * Selectors
	 */

	getYesButton() {
		return by.css( '.welcome__submit .dops-button.is-primary' );
	}

	getNoButton() {
		return by.css( '.welcome__submit .dops-button:nth-child( 2 )' );
	}
}
