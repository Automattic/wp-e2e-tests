import { By as by } from 'selenium-webdriver';
import config from 'config';
import BaseContainer from '../../base-container';
import * as driverHelper from '../../driver-helper';

const getUrl = () => {
	const urlBase = config.get( 'bluehostTestDomain' );
	return `${urlBase}/wp-admin/#welcome/steps/jetpack`;
};

const getJetpackStepSelector = () => {
	return by.css( 'p.welcome__jetpack--callout' );
}

export default class BluehostJPOJetpackStepPage extends BaseContainer {
	constructor( driver, visit = false ) {
		super( driver, getJetpackStepSelector(), visit, getUrl() );
	}

	clickConnectButton() {
		return driverHelper.clickWhenClickable( this.driver, this.getConnectButton() );
	}

	clickNotNowButton() {
		return driverHelper.clickWhenClickable( this.driver, this.getNotNowButton() );
	}

	revisitJetpackStep() {
		this.driver.get( getUrl() );
		return driverHelper.waitTillPresentAndDisplayed( this.driver, getJetpackStepSelector() );
	}

	/*
	 * Selectors
	 */

	getConnectButton() {
		return by.css( '#welcome__jetpack .welcome__submit .dops-button.is-primary' );
	}

	getNotNowButton() {
		return by.css( '#welcome__jetpack .welcome__submit .welcome__skip-step' );
	}
}
