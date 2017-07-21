import { By as by } from 'selenium-webdriver';
import config from 'config';
import BaseContainer from '../../base-container';
import * as driverHelper from '../../driver-helper';

const getUrl = () => {
	const urlBase = config.get( 'bluehostTestDomain' );
	return `${urlBase}/wp-admin/#welcome/steps/review`;
};

const getReviewStepSelector = () => {
	return by.xpath( '//p[text()="Great Work!"]' );
}

export default class BluehostJPOReviewStepPage extends BaseContainer {
	constructor( driver, visit = false ) {
		super( driver, getReviewStepSelector(), visit, getUrl() );
	}

	clickDismissButton() {
		return driverHelper.clickWhenClickable( this.driver, this.getDismissButton() );
	}

	/*
	 * Selectors
	 */

	getDismissButton() {
		return by.css( '.welcome__dismiss > a' );
	}
}
