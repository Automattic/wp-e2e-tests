import webdriver from 'selenium-webdriver';
import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';
import SecurePaymentComponent from '../components/secure-payment-component.js';

const by = webdriver.By;
const until = webdriver.until;

export default class PlansPage extends BaseContainer {
	constructor( driver ) {
		// Reset the AB test key that removes the .plan-list selector defining this page
		const myPlansKey = 'sidebarPlanLinkMyPlan_20160101';
		const myPlansValue = 'plans';

		const expectedABTestValue = `{"${myPlansKey}":"${myPlansValue}"}`;

		driver.executeScript( `window.localStorage.setItem('ABTests','${expectedABTestValue}');` );

		driver.getCurrentUrl().then( ( currentUrl ) => {
			let newUrl = currentUrl.replace( 'my-plan/', '' ); // remove the my-plan path from url as this overides local storage

			if ( currentUrl !== newUrl ) {
				console.log( `Changing URLs for my-plan AB test: OLD URL: '${ currentUrl }' NEW URL: '${ newUrl }'` );
			}

			driver.get( newUrl );
		} );

		super( driver, by.className( 'plan-list' ) );
	}
	clickComparePlans() {
		let selector = by.css( 'a.compare-plans-link' );
		return driverHelper.clickWhenClickable( this.driver, selector, this.explicitWaitMS );
	}
	waitForComparison() {
		return this.driver.wait( until.elementLocated( by.css( '.plans-compare__table' ) ), this.explicitWaitMS, 'Could not locate the compare plans page' );
	}
	returnFromComparison() {
		let selector = by.css( 'a.header-cake__back' );
		return driverHelper.clickWhenClickable( this.driver, selector, this.explicitWaitMS );
	}
	purchasePremium() {
		var d = webdriver.promise.defer();

		var testCardHolder = 'End To End Testing';
		var testVisaNumber = '4483910254901646';
		var testVisaExpiry = '02/19';
		var testCVV = '300';
		var testCardCountryCode = 'AU';
		var testCardPostCode = '4000';

		this.driver.findElement( by.css( '.plan.value_bundle button' ) ).click();
		let securePaymentComponent = new SecurePaymentComponent( this.driver );
		securePaymentComponent.enterTestCreditCardDetails( testCardHolder, testVisaNumber, testVisaExpiry, testCVV, testCardCountryCode, testCardPostCode );
		securePaymentComponent.submitPaymentDetails();

		this.driver.wait( until.elementLocated( by.className( 'checkout-thank-you' ) ), this.explicitWaitMS, 'Could not locate the checkout thank you page' );

		d.fulfill( true );
		return d.promise;
	}
}
