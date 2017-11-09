/** @format */
import { By, until } from 'selenium-webdriver';
import BaseContainer from '../base-container';

import * as driverHelper from '../driver-helper';

const WPORG_CREATOR_SERVICES = {
	'jurassic.ninja': {
		TEMPLATE_URL: 'http://jurassic.ninja/create?shortlived',
		PASSWORD_ELEMENT: By.css( '#jurassic_password' ),
		URL_ELEMENT: By.css( '#jurassic_url' ),
		CONTINUE_LINK: By.linkText( 'The new WP is ready to go, visit it!' ),
		PROGRESS_MESSAGE: By.css( '#progress' ),
	},
	'poopy.life': {
		TEMPLATE_URL: 'http://poopy.life/create',
		PASSWORD_ELEMENT: By.css( '#tdr_password' ),
		URL_ELEMENT: By.css( '#tdr_url' ),
		CONTINUE_LINK: By.css( '.continue-to-install' ),
		PROGRESS_MESSAGE: By.css( '.ct-image' ),
	},
};

export default class WporgCreatorPage extends BaseContainer {
	constructor( driver, service = 'jurassic.ninja' ) {
		const { CONTINUE_LINK, PROGRESS_MESSAGE, TEMPLATE_URL } = WPORG_CREATOR_SERVICES[ service ];
		super( driver, PROGRESS_MESSAGE, /* visit url */ true, TEMPLATE_URL );
		this.elements = WPORG_CREATOR_SERVICES[ service ];
		driverHelper.waitTillPresentAndDisplayed( driver, CONTINUE_LINK, this.explicitWaitMS * 2 );
		driverHelper.clickWhenClickable( driver, CONTINUE_LINK );
	}

	getPassword() {
		const { PASSWORD_ELEMENT } = this.elements;
		this.driver.wait( until.elementLocated( PASSWORD_ELEMENT ) );
		return this.driver.findElement( PASSWORD_ELEMENT ).getText();
	}

	getUrl() {
		const { URL_ELEMENT } = this.elements;
		this.driver.wait( until.elementLocated( URL_ELEMENT ) );
		return this.driver.findElement( URL_ELEMENT ).getText();
	}

	waitForWpadmin() {
		const { PASSWORD_ELEMENT } = this.elements;
		return driverHelper.waitTillPresentAndDisplayed( this.driver, PASSWORD_ELEMENT );
	}
}
