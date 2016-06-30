import { By, until } from 'selenium-webdriver';

import BaseContainer from '../../base-container.js';

import * as driverHelper from '../../driver-helper.js';
import { currentScreenSize } from '../../driver-manager.js';

const screenSize = currentScreenSize();

export default class PickAPlanPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.free_plan .plan-header__title' ) );
	}
	selectFreePlan() {
		const freePlanHeaderSelector = By.css( '.free_plan .plan-header__title' );
		const freePlanButtonSelector = By.css( '.free_plan button' );
		driverHelper.clickWhenClickable( this.driver, freePlanHeaderSelector, this.explicitWaitMS );
		if ( screenSize === 'mobile' ) {
			this.waitForPlanButton( freePlanButtonSelector );
			return driverHelper.clickWhenClickable( this.driver, freePlanButtonSelector, this.explicitWaitMS );
		}
	}
	selectPersonalPlan() {
		const personalPlanHeaderSelector = By.css( 'div.personal-bundle .plan-header__title' );
		const personalPlanButtonSelector = By.css( 'div.personal-bundle button' );
		driverHelper.clickWhenClickable( this.driver, personalPlanHeaderSelector, this.explicitWaitMS );
		if ( screenSize === 'mobile' ) {
			this.waitForPlanButton( personalPlanButtonSelector );
			return driverHelper.clickWhenClickable( this.driver, personalPlanButtonSelector, this.explicitWaitMS );
		}
	}
	selectPremiumPlan() {
		const premiumPlanHeaderSelector = By.css( 'div.value_bundle .plan-header__title' );
		const premiumPlanButtonSelector = By.css( 'div.value_bundle button' );
		driverHelper.clickWhenClickable( this.driver, premiumPlanHeaderSelector, this.explicitWaitMS );
		if ( screenSize === 'mobile' ) {
			this.waitForPlanButton( premiumPlanButtonSelector );
			return driverHelper.clickWhenClickable( this.driver, premiumPlanButtonSelector, this.explicitWaitMS );
		}
	}
	selectBusinessPlan() {
		const businessPlanHeaderSelector = By.css( 'div.business-bundle .plan-header__title' );
		const businessPlanButtonSelector = By.css( 'div.business-bundle button' );
		driverHelper.clickWhenClickable( this.driver, businessPlanHeaderSelector, this.explicitWaitMS );
		if ( screenSize === 'mobile' ) {
			this.waitForPlanButton( businessPlanButtonSelector );
			return driverHelper.clickWhenClickable( this.driver, businessPlanButtonSelector, this.explicitWaitMS );
		}
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
