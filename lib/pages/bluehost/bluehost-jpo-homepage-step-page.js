import { By as by } from 'selenium-webdriver';
import config from 'config';
import BaseContainer from '../../base-container';
import * as driverHelper from '../../driver-helper';

const getUrl = () => {
	const urlBase = config.get( 'bluehostTestDomain' );
	return `${urlBase}/wp-admin/#welcome/steps/homepage`;
};

const getHomepageSelector = () => {
	return by.xpath( '//p[text()="What should visitors see on your homepage?"]' );
}

export default class BluehostJPOHomepageStepPage extends BaseContainer {
	constructor( driver, visit = false ) {
		super( driver, getHomepageSelector(), visit, getUrl() );
	}

	clickBlogRadio() {
		return driverHelper.clickWhenClickable( this.driver, this.getBlogRadio() );
	}

	clickStaticRadio() {
		return driverHelper.clickWhenClickable( this.driver, this.getStaticRadio() );
	}

	clickSkipThisStep() {
		return driverHelper.clickWhenClickable( this.driver, this.getSkipStepButton() );
	}

	revisitHomepageStep() {
		this.driver.get( getUrl() );
		return driverHelper.waitTillPresentAndDisplayed( this.driver, getHomepageSelector() );
	}

	/*
	 * Selectors
	 */

	getBlogRadio() {
		return by.css( '.welcome__homepage-cols > .welcome__homepage-col:nth-child( 1 ) > label' );
	}

	getStaticRadio() {
		return by.css( '.welcome__homepage-cols > .welcome__homepage-col:nth-child( 2 ) > label' );
	}

	getSkipStepButton() {
		return by.css( '.welcome__skip-link.dops-button' );
	}
}
