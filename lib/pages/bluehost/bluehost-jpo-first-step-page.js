import { By as by } from 'selenium-webdriver';
import config from 'config';
import BaseContainer from '../../base-container';
import * as driverHelper from '../../driver-helper';

const getUrl = ( doReset = false ) => {
	const urlBase = config.get( 'bluehostTestDomain' );
	return doReset
		? `${urlBase}/wp-admin/index.php?jpo_reset=1`
		: `${urlBase}/wp-admin/#welcome/steps/title`;
};

export default class BluehostJPOFirstStepPage extends BaseContainer {
	constructor( driver, visit = false, doReset = false ) {
		super( driver, by.css( '.welcome__wrapper' ), visit, getUrl( doReset ) );
	}

	selectBusinessType() {
		return driverHelper.clickWhenClickable( this.driver, this.getBusinessTypeSelector() );
	}

	selectPersonalType() {
		return driverHelper.clickWhenClickable( this.driver, this.getPersonalTypeSelector() );
	}

	submitSiteTitleAndDescriptionForm() {
		return driverHelper.clickWhenClickable( this.driver, this.getNextStepButton() );
	}

	resetJPO() {
		this.driver.get( getUrl( true ) );
		this.driver.switchTo().alert().then( function( alert ) {
			alert.accept();
		} );

		return driverHelper.waitTillPresentAndDisplayed( this.driver, this.getFirstStepSelector() );
	}

	/*
	 * Selectors
	 */

	getFirstStepSelector() {
		return by.css( '.welcome__get-started--intro' );
	}

	getSiteTitleSelector() {
		return by.css( '#welcome__site-title' );
	}

	getNoHelpNeededSelector() {
		return by.css( '.welcome__get-started--wrapper > p > a' );
	}

	getBusinessTypeSelector() {
		return by.css( '.welcome__get-started--wrapper > p > .dops-button:nth-child( 1 )' );
	}

	getPersonalTypeSelector() {
		return by.css( '.welcome__get-started--wrapper > p > .dops-button:nth-child( 2 )' );
	}

	getSiteTitleSelector() {
		return by.css( 'input#site-title' );
	}

	getSiteDescriptionSelector() {
		return by.css( 'input#site-description' );
	}

	getNextStepButton() {
		return by.css( '.welcome-submit.dops-button.is-primary' );
	}
}
