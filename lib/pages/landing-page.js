/** @format */

import { By as by } from 'selenium-webdriver';
import assert from 'assert';
import BaseContainer from '../base-container.js';

export default class LandingPage extends BaseContainer {
	constructor( driver, url ) {
		super( driver, by.css( 'header.masterbar' ), true, url );
		this.waitForPage();
		this.checkURL();
	}

	checkURL() {
		this.driver.getCurrentUrl().then( currentUrl => {
			assert.equal(
				true,
				currentUrl.includes( 'wordpress.com' ),
				`The current url: '${ currentUrl }' does not include 'wordpress.com'`
			);
		} );
	}

	checkLocalizedString( targetString ) {
		this.waitForPage();
		assert(
			this.driver.findElement( by.linkText( targetString ) ),
			'The landing page does not have the expected localized string "' + targetString + '"'
		);
	}
}
