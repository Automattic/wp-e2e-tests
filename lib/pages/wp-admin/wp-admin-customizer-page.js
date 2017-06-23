import { By as by, until } from 'selenium-webdriver';
import BaseContainer from '../../base-container';

// import * as driverHelper from '../../driver-helper';
// import * as driverManager from '../../driver-manager';

export default class WpAdminCustomizerPage extends BaseContainer {
	constructor( driver ) {
		const expectedElementSelector = by.css( '.wp-customizer' );
		super( driver, expectedElementSelector );
	}

	relatedPostsSectionShown() {
		let present = false;

		present = this.driver.wait( until.elementLocated( by.css( '#sub-accordion-section-jetpack_relatedposts' ) ), this.explicitWaitMS ).then( () => {
			return true;
		}, ( ) => {
			return false;
		} );
		return present;
	}
}
