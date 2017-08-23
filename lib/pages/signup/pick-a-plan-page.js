import { By, until } from 'selenium-webdriver';

import BaseContainer from '../../base-container.js';

import * as driverHelper from '../../driver-helper.js';
import { currentScreenSize } from '../../driver-manager.js';

const screenSize = currentScreenSize();

export default class PickAPlanPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.plans-features-main__group' ) );
	}
	selectFreePlan() {
		return driverHelper.clickWhenClickable( this.driver, By.css( 'table button.is-free-plan' ), this.explicitWaitMS );
	}
	selectPersonalPlan() {
		var personalPlanButtonSelector;

		if ( screenSize === 'mobile' ) {
			personalPlanButtonSelector = By.css( '.plan-features__mobile button.is-personal-plan' );
		} else {
			personalPlanButtonSelector = By.css( 'table button.is-personal-plan' );
		}

		return driverHelper.clickWhenClickable( this.driver, personalPlanButtonSelector, this.explicitWaitMS );
	}
	selectPremiumPlan() {
		var premiumPlanButtonSelector;

		if ( screenSize === 'mobile' ) {
			premiumPlanButtonSelector = By.css( '.plan-features__mobile button.is-premium-plan' );
		} else {
			premiumPlanButtonSelector = By.css( 'table button.is-premium-plan' );
		}
		driverHelper.waitTillPresentAndDisplayed( this.driver, premiumPlanButtonSelector );
		return driverHelper.clickWhenClickable( this.driver, premiumPlanButtonSelector );
	}
	selectBusinessPlan() {
		var businessPlanButtonSelector;

		if ( screenSize === 'mobile' ) {
			businessPlanButtonSelector = By.css( '.plan-features__mobile button.is-business-plan' );
		} else {
			businessPlanButtonSelector = By.css( 'table button.is-business-plan' );
		}

		return driverHelper.clickWhenClickable( this.driver, businessPlanButtonSelector, this.explicitWaitMS );
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
