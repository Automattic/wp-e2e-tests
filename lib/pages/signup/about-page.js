/** @format */

import { By } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper.js';

import BaseContainer from '../../base-container.js';

export default class AboutPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.about__wrapper' ) );
	}

	async submitForm() {
		const buttonSelector = By.css( '.about__submit-wrapper button.is-primary' );
		await driverHelper.waitTillPresentAndDisplayed( this.driver, buttonSelector );
		return await driverHelper.clickWhenClickable( this.driver, buttonSelector );
	}

	async enterSiteDetails(
		siteTitle,
		siteTopic,
		{ showcase = false, share = false, sell = false, educate = false, promote = false } = {}
	) {
		await driverHelper.waitForFieldClearable( this.driver, By.css( '#siteTitle' ) );
		await driverHelper.setWhenSettable( this.driver, By.css( '#siteTitle' ), siteTitle );
		await driverHelper.setWhenSettable( this.driver, By.css( '#siteTopic' ), siteTopic );
		if ( showcase === true ) {
			await driverHelper.setCheckbox( this.driver, By.css( '#showcase' ) );
		}
		if ( share === true ) {
			await driverHelper.setCheckbox( this.driver, By.css( '#share' ) );
		}
		if ( sell === true ) {
			await driverHelper.setCheckbox( this.driver, By.css( '#sell' ) );
		}
		if ( educate === true ) {
			await driverHelper.setCheckbox( this.driver, By.css( '#educate' ) );
		}
		if ( promote === true ) {
			await driverHelper.setCheckbox( this.driver, By.css( '#promote' ) );
		}
	}
}
