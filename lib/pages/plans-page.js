import webdriver from 'selenium-webdriver';
import BaseContainer from '../base-container';
import * as driverHelper from '../driver-helper';
import * as dataHelper from '../data-helper';

const by = webdriver.By;
const until = webdriver.until;
const host = dataHelper.getJetpackHost();

export default class PlansPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.is-section-plans' ) );
	}
	openPlansTab() {
		driverHelper.ensureMobileMenuOpen( this.driver );
		const selector = by.css( '.current-plan a[href*="plans"]:not([href*="my-plan"]).section-nav-tab__link' );
		return driverHelper.clickWhenClickable( this.driver, selector, this.explicitWaitMS );
	}
	waitForComparison() {
		return this.driver.wait( until.elementLocated( by.css( '.plans-features-main__group' ) ), this.explicitWaitMS, 'Could not locate the compare plans page' );
	}

	returnFromComparison() {
		const selector = by.css( '.header-cake__back' );
		return driverHelper.clickWhenClickable( this.driver, selector, this.explicitWaitMS );
	}

	confirmCurrentPlan( planName ) {
		let selector = by.css( `.is-current.is-${planName}-plan` );
		if ( host !== 'WPCOM' ) {
			selector = by.css( `.is-${planName}-plan` );
		}

		return driverHelper.isEventuallyPresentAndDisplayed( this.driver, selector );
	}

	planTypesShown( planType ) {
		const selector = by.css( `[data-e2e-plans="${planType}"]` );
		return driverHelper.isEventuallyPresentAndDisplayed( this.driver, selector );
	}
}
