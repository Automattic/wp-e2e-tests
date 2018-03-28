/** @format */
import { By, until } from 'selenium-webdriver';
import config from 'config';
import BaseContainer from '../base-container';

import * as driverHelper from '../driver-helper';
import * as dataHelper from '../data-helper';

const jurassicNinjaCreateURL = 'http://jurassic.ninja/create';

const TEMPLATES = {
	default: `${jurassicNinjaCreateURL}?shortlived`,
	noJetpack: `${jurassicNinjaCreateURL}?shortlived&nojetpack`,
	jetpackMaster: `${jurassicNinjaCreateURL}?shortlived&jetpack-beta`,
	branch: `${jurassicNinjaCreateURL}?shortlived&jetpack-beta`
};

const PASSWORD_ELEMENT = By.css( '#jurassic_password' );
const USERNAME_ELEMENT = By.css( '#jurassic_username' );
const URL_ELEMENT = By.css( '#jurassic_url' );
const CONTINUE_LINK = By.linkText( 'The new WP is ready to go, visit it!' );
const PROGRESS_MESSAGE = By.css( '#progress' );

export default class WporgCreatorPage extends BaseContainer {
	constructor( driver, template = 'default' ) {
		if ( ! TEMPLATES[ template ] ) {
			throw new Error( 'Incorrect WporgCreatorPage template specified.' );
		}

		let url = TEMPLATES[ template ];
		if ( dataHelper.isRunningOnJetpackBranch() ) {
			url += `&branch=${config.get( 'jetpackBranchName' )}`;
		}
		super( driver, PROGRESS_MESSAGE, /* visit url */ true, url );
		driverHelper.waitTillPresentAndDisplayed( driver, CONTINUE_LINK, this.explicitWaitMS * 6 );
		driverHelper.clickWhenClickable( driver, CONTINUE_LINK );
	}

	getPassword() {
		driverHelper.waitTillPresentAndDisplayed( this.driver, PASSWORD_ELEMENT );
		return this.driver.findElement( PASSWORD_ELEMENT ).getText();
	}

	getUsername() {
		driverHelper.waitTillPresentAndDisplayed( this.driver, USERNAME_ELEMENT );
		return this.driver.findElement( USERNAME_ELEMENT ).getText();
	}

	getUrl() {
		this.driver.wait( until.elementLocated( URL_ELEMENT ) );
		return this.driver.findElement( URL_ELEMENT ).getText();
	}

	waitForWpadmin() {
		return driverHelper.waitTillPresentAndDisplayed( this.driver, PASSWORD_ELEMENT );
	}
}
