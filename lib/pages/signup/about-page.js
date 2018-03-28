import { By } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper.js';

import BaseContainer from '../../base-container.js';

export default class AboutPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.about__wrapper' ) );
	}

	submitForm() {
		const buttonSelector = By.css( '.about__submit-wrapper button.is-primary' );
		driverHelper.waitTillPresentAndDisplayed( this.driver, buttonSelector );
		return driverHelper.clickWhenClickable( this.driver, buttonSelector );
	}

	enterSiteDetails( siteTitle, siteTopic, { showcase = false, share = false, sell = false, educate = false, promote = false } = {} ) {
		driverHelper.setWhenSettable( this.driver, By.css( '#siteTitle' ), siteTitle );
		driverHelper.setWhenSettable( this.driver, By.css( '#siteTopic' ), siteTopic );
		if ( showcase === true ) {
			driverHelper.setCheckbox( this.driver, By.css( '#showcase' ) );
		}
		if ( share === true ) {
			driverHelper.setCheckbox( this.driver, By.css( '#share' ) );
		}
		if ( sell === true ) {
			driverHelper.setCheckbox( this.driver, By.css( '#sell' ) );
		}
		if ( educate === true ) {
			driverHelper.setCheckbox( this.driver, By.css( '#educate' ) );
		}
		if ( promote === true ) {
			driverHelper.setCheckbox( this.driver, By.css( '#promote' ) );
		}
	}
}
