import { By, until } from 'selenium-webdriver';

import BaseContainer from '../../base-container.js';

import * as driverHelper from '../../driver-helper.js';
import * as driverManager from '../../driver-manager.js';

export default class PickAPlanPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.free_plan .plan-header__title' ) );
	}
	selectFreePlan() {
		const freePlanHeaderSelector = By.css( '.free_plan .plan-header__title' );
		const freePlanButtonSelector = By.css( '.free_plan button' );
		driverHelper.clickWhenClickable( this.driver, freePlanHeaderSelector, this.explicitWaitMS );
		this.waitForPlanButton( freePlanButtonSelector );
		return driverHelper.clickWhenClickable( this.driver, freePlanButtonSelector, this.explicitWaitMS );
	}
	selectPremiumPlan() {
		const premiumPlanHeaderSelector = By.css( 'div.value_bundle .plan-header__title' );
		const premiumPlanButtonSelector = By.css( 'div.value_bundle button' );
		driverHelper.clickWhenClickable( this.driver, premiumPlanHeaderSelector, this.explicitWaitMS );
		this.waitForPlanButton( premiumPlanButtonSelector );
		return driverHelper.clickWhenClickable( this.driver, premiumPlanButtonSelector, this.explicitWaitMS );
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
}
