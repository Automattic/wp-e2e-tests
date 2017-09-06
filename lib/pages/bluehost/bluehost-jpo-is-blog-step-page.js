import { By as by } from 'selenium-webdriver';
import config from 'config';
import BaseContainer from '../../base-container';
import * as driverHelper from '../../driver-helper';

const getUrl = () => {
	const urlBase = config.get( 'bluehostTestDomain' );
	return `${urlBase}/wp-admin/#welcome/steps/is-blog`;
};

const getIsBlogStepSelector = () => {
	return by.xpath( '//p[text()="Are you going to update your site with news or blog posts?"]' );
}

export default class BluehostJPOIsBlogStepPage extends BaseContainer {
	constructor( driver, visit = false ) {
		super( driver, getIsBlogStepSelector(), visit, getUrl() );
	}

	clickYesButton() {
		return driverHelper.clickWhenClickable( this.driver, this.getYesButton() );
	}

	clickNopeButton() {
		return driverHelper.clickWhenClickable( this.driver, this.getNopeButton() );
	}

	revisitIsBlogStep() {
		this.driver.get( getUrl() );
		this.driver.switchTo().alert().then( function( alert ) {
			alert.accept();
		} );

		return driverHelper.waitTillPresentAndDisplayed( this.driver, getIsBlogStepSelector() );
	}

	/*
	 * Selectors
	 */

	getYesButton() {
		return by.css( '.dops-button.is-primary' );
	}

	getNopeButton() {
		return by.css( '.dops-button' );
	}
}
