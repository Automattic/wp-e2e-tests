import webdriver from 'selenium-webdriver';
import config from 'config';
import assert from 'assert';

import * as driverManager from './driver-manager';
import * as mediaHelper from './media-helper';
import * as slackNotifier from './slack-notifier';

const until = webdriver.until;

export default class BaseContainer {
	constructor( driver, expectedElementSelector, visit = false, url = null ) {
		this.screenSize = driverManager.currentScreenSize().toUpperCase();
		this.explicitWaitMS = config.get( 'explicitWaitMS' );
		this.driver = driver;
		this.expectedElementSelector = expectedElementSelector;
		this.url = url;
		if ( visit === true ) {
			this.driver.get( this.url );
		}
		this.waitForPage();
		this.checkForUnknownABTestKeys();
	}

	takeScreenShot( screenName = '' ) {
		if ( config.get( 'saveAllScreenshots' ) === true ) {
			const prefix = ( screenName === '' ) ? `BaseContainer-${this.screenSize}-` : `${screenName}-${this.screenSize}-`;
			try {
				return this.driver.takeScreenshot().then( ( data ) => {
					mediaHelper.writeScreenshot( data, prefix );
				} );
			} catch ( e ) {
				console.log( `Error when taking screenshot in base container: '${e}'` );
			}
		}
	}

	waitForPage() {
		this.driver.wait( until.elementLocated( this.expectedElementSelector ), this.explicitWaitMS, 'Could not locate the ' + this.expectedElementSelector.value + ' element. Check that is is displayed.' );
	}

	displayed() {
		return this.driver.isElementPresent( this.expectedElementSelector );
	}

	title() {
		return this.driver.getTitle();
	}

	urlDisplayed() {
		return this.driver.getCurrentUrl();
	}

	checkForUnknownABTestKeys() {
		const knownABTestKeys = config.get( 'knownABTestKeys' );

		return this.driver.executeScript( 'return window.localStorage.ABTests;' ).then( ( abtestsValue ) => {
			for ( let key in JSON.parse( abtestsValue ) ) {
				let testName = key.split( '_' )[0];
				if ( knownABTestKeys.indexOf( testName ) < 0 ) {
					const message = `Found an AB Testing key in local storage that isn\'t known: '${testName}'. This may cause inconsistent A/B test behaviour, please check this is okay and add it to 'knownABTestKeys' in default.config`;
					slackNotifier.warn( message, { suppressDuplicateMessages: true } );
				}
			}
		} );
	}
	setABTestControlGroupsInLocalStorage( culture = 'en', flow = 'main' ) {
		const privacyCheckBoxKey = 'privacyCheckbox_20160310';
		const privacyCheckBoxValue = 'original';
		const freeTrialsSignupKey = 'freeTrialsInSignup_20160328';
		const freeTrialsSignupValue = 'disabled';
		const domainsWithPlanKey = 'domainsWithPlansOnly_20160517';
		const domainsWithPlanValue = 'plansOnly';
		const guidedToursKey = 'guidedTours_20160603';
		const guidedToursValue = 'original';
		const domainCreditsKey = 'domainCreditsInfoNotice_20160420';
		const domainCreditsValue = 'showNotice';
		const domainSuggestionVendorKey = 'domainSuggestionVendor_20160614';
		const domainSuggestionVendorValue = 'domainsbot';
		const googleVoucherKey = 'googleVouchers_20160615';
		const googleVoucherValue = 'enabled';
		const personalPlanKey = 'personalPlan_20160622';
		const personalPlanValue = 'hide';

		const expectedABTestValue = `{"${privacyCheckBoxKey}":"${privacyCheckBoxValue}","${freeTrialsSignupKey }":"${freeTrialsSignupValue}","${domainsWithPlanKey}":"${domainsWithPlanValue}","${guidedToursKey}":"${guidedToursValue}","${domainCreditsKey}":"${domainCreditsValue}","${domainSuggestionVendorKey}":"${domainSuggestionVendorValue}","${googleVoucherKey}":"${googleVoucherValue}","${personalPlanKey}":"${personalPlanValue}"}`;

		this.driver.executeScript( `window.localStorage.setItem('ABTests','${expectedABTestValue}');` );

		this.driver.executeScript( `window.localStorage.setItem('signupFlowName','"${flow}"');` );

		this.driver.getCurrentUrl().then( ( currentUrl ) => {
			const culturePath = `/${culture}`;
			let newUrl = currentUrl.replace( 'upgrade/', '' ); // remove the upgrade path as this overrides local storage
			newUrl = newUrl.replace( 'layout/survey', '' ); // remove the layout path as this indicates Headstart, which is not yet supported in these tests

			if ( culture.toLowerCase() !== 'en' ) {
				if ( !newUrl.endsWith( culturePath ) ) {
					newUrl = newUrl + culturePath;
				}
			}

			if ( currentUrl !== newUrl ) {
				console.log( `Changing URLs for various AB tests: OLD URL: '${ currentUrl }' NEW URL: '${ newUrl }'` );
			}

			this.driver.get( newUrl );
		} );

		this.driver.executeScript( 'return window.localStorage.signupFlowName;' ).then( ( flowValue ) => {
			assert.equal( flowValue, `"${flow}"`, 'The local storage value for flow wasn\'t set correctly' );
		} );

		this.driver.executeScript( 'return window.localStorage.ABTests;' ).then( ( abtestsValue ) => {
			if ( abtestsValue !== expectedABTestValue ) {
				const message = `The localstorage value for AB tests wasn't set correctly.\nExpected value is:\n'${expectedABTestValue}'\nActual value is:\n'${abtestsValue}'`;
				slackNotifier.warn( message, { suppressDuplicateMessages: true } );
			}
		} );

		return this.waitForPage();
	}
}
