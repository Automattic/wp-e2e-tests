/** @format */
import { By, until } from 'selenium-webdriver';
import BaseContainer from '../base-container';

import * as driverHelper from '../driver-helper';

const TEMPLATES = {
	default: 'http://jurassic.ninja/create?shortlived',
	noJetpack: 'http://jurassic.ninja/create?shortlived&nojetpack',
};

const PASSWORD_ELEMENT = By.css( '#jurassic_password' );
const URL_ELEMENT = By.css( '#jurassic_url' );
const CONTINUE_LINK = By.linkText( 'The new WP is ready to go, visit it!' );
const PROGRESS_MESSAGE = By.css( '#progress' );

export default class WporgCreatorPage extends BaseContainer {
	constructor( driver, template = 'default' ) {
		if ( ! TEMPLATES[ template ] ) {
			throw new Error( 'Incorrect WporgCreatorPage template specified.' );
		}

		super( driver, PROGRESS_MESSAGE, /* visit url */ true, TEMPLATES[ template ] );
		driverHelper.waitTillPresentAndDisplayed( driver, CONTINUE_LINK, this.explicitWaitMS * 3 );
		driverHelper.clickWhenClickable( driver, CONTINUE_LINK );
	}

	parseOptions( options ) {
		options = {
			'jetpack-beta': true,
			branch: 'fix/fill-rule-in-plans-page',
			nojetpack: true,
			shortlived: true
		};

		let path = '';
		for ( let e in options ) {
			if ( options[e] === true ) {
				path += '&' + e;
			} else {
				path += '&' + e + '=' + options[e];
			}
		}
		return path;
	}

	getPassword() {
		this.driver.wait( until.elementLocated( PASSWORD_ELEMENT ) );
		return this.driver.findElement( PASSWORD_ELEMENT ).getText();
	}

	getUrl() {
		this.driver.wait( until.elementLocated( URL_ELEMENT ) );
		return this.driver.findElement( URL_ELEMENT ).getText();
	}

	waitForWpadmin() {
		return driverHelper.waitTillPresentAndDisplayed( this.driver, PASSWORD_ELEMENT );
	}
}
