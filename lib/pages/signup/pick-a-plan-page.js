import { By, until } from 'selenium-webdriver';

import BaseContainer from '../../base-container.js';

import * as driverHelper from '../../driver-helper.js';
import { getJetpackHost } from '../../data-helper.js';
import { currentScreenSize } from '../../driver-manager.js';

const host = getJetpackHost();
const screenSize = currentScreenSize();

export default class PickAPlanPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.plans-features-main__group' ) );
	}
	_selectPlan( level ) {
		let prefix = 'table';
		if ( host !== 'WPCOM' && screenSize === 'mobile' ) {
			prefix = '.plan-features__mobile-plan';
		}

		const selector = By.css( `${prefix} button.is-${level}-plan` );
		return driverHelper.clickWhenClickable( this.driver, selector );
	}
	selectFreePlan() {
		return this._selectPlan( 'free' );
	}
	selectPersonalPlan() {
		return this._selectPlan( 'personal' );
	}
	selectPremiumPlan() {
		return this._selectPlan( 'premium' );
	}
	selectBusinessPlan() {
		return this._selectPlan( 'business' );
	}
	compare() {
		return driverHelper.clickWhenClickable( this.driver, By.css( 'a.plans-step__compare-plans-link' ), this.explicitWaitMS );
	}
	waitForPlanComparisons() {
		const plansSelector = By.css( 'div.plans-compare' );
		this.driver.wait( until.elementLocated( plansSelector ), this.explicitWaitMS, 'Could not locate plan comparison chart' );
		const plansElement = this.driver.findElement( plansSelector );
		return this.driver.wait( until.elementIsVisible( plansElement ), this.explicitWaitMS, 'Could not see plan comparison chart visible' );
	}
	waitForPlans() {
		this.driver.wait( until.elementLocated( this.expectedElementSelector ), this.explicitWaitMS, 'Could not locate the pick a plan page.' );
		const expectedElement = this.driver.findElement( this.expectedElementSelector );
		return this.driver.wait( until.elementIsVisible( expectedElement ), this.explicitWaitMS, 'Could not see the pick a plan expected element visible.' );
	}
	waitForPlanButton( planButtonSelector ) {
		this.driver.wait( until.elementLocated( planButtonSelector ), this.explicitWaitMS, `Could not locate the plan button for: '${planButtonSelector.toString()}'` );
		const planButtonElement = this.driver.findElement( planButtonSelector );
		return this.driver.wait( until.elementIsVisible( planButtonElement ), this.explicitWaitMS, `The plan button for: '${planButtonSelector.toString()}' was not visible` );
	}
	goBackToPlans() {
		return driverHelper.clickWhenClickable( this.driver, By.css( '.header-cake__back' ), this.explicitWaitMS );
	}
	personalPlanPrice() {
		const selector = By.css( 'div.personal-bundle div.wpcom-plan-price span' );
		this.driver.wait( until.elementLocated( selector ), this.explicitWaitMS, 'Could not locate the premium plan price element' );
		return this.driver.findElement( selector ).getText();
	}
	premiumPlanPrice() {
		const selector = By.css( 'div.value_bundle div.wpcom-plan-price span' );
		this.driver.wait( until.elementLocated( selector ), this.explicitWaitMS, 'Could not locate the premium plan price element' );
		return this.driver.findElement( selector ).getText();
	}
	businessPlanPrice() {
		const selector = By.css( 'div.business-bundle div.wpcom-plan-price span' );
		this.driver.wait( until.elementLocated( selector ), this.explicitWaitMS, 'Could not locate the business plan price element' );
		return this.driver.findElement( selector ).getText();
	}
}
