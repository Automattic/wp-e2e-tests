/** @format */

import config from 'config';
import assert from 'assert';
import { isEqual } from 'lodash';

import * as driverManager from './driver-manager';
import * as driverHelper from './driver-helper';
import * as mediaHelper from './media-helper';
import * as slackNotifier from './slack-notifier';

export default class BaseContainer {
	constructor(
		driver,
		expectedElementSelector,
		visit = false,
		url = null,
		waitMS = config.get( 'explicitWaitMS' )
	) {
		this.screenSize = driverManager.currentScreenSize().toUpperCase();
		this.explicitWaitMS = waitMS;
		this.driver = driver;
		this.expectedElementSelector = expectedElementSelector;
		this.url = url;
		if ( visit === true ) {
			this.driver.get( this.url );
		}
		this.waitForPage();
		this.checkForUnknownABTestKeys();
		this.checkForConsoleErrors();
	}

	takeScreenShot( screenName = '' ) {
		if ( config.get( 'saveAllScreenshots' ) === true ) {
			const prefix =
				screenName === ''
					? `BaseContainer-${ this.screenSize }-`
					: `${ screenName }-${ this.screenSize }-`;
			try {
				return this.driver.takeScreenshot().then( data => {
					mediaHelper.writeScreenshot( data, prefix );
				} );
			} catch ( e ) {
				console.log( `Error when taking screenshot in base container: '${ e }'` );
			}
		}
	}

	waitForPage() {
		return driverHelper.waitTillPresentAndDisplayed(
			this.driver,
			this.expectedElementSelector,
			this.explicitWaitMS
		);
	}

	async displayed() {
		return await driverHelper.isEventuallyPresentAndDisplayed(
			this.driver,
			this.expectedElementSelector,
			this.explicitWaitMS
		);
	}

	title() {
		return this.driver.getTitle();
	}

	urlDisplayed() {
		return this.driver.getCurrentUrl();
	}

	checkForConsoleErrors() {
		return driverHelper.checkForConsoleErrors( this.driver );
	}

	checkForUnknownABTestKeys() {
		const knownABTestKeys = config.get( 'knownABTestKeys' );

		return this.driver
			.executeScript( 'return window.localStorage.ABTests;' )
			.then( abtestsValue => {
				for ( let key in JSON.parse( abtestsValue ) ) {
					let testName = key.split( '_' )[ 0 ];
					if ( knownABTestKeys.indexOf( testName ) < 0 ) {
						const message = `Found an AB Testing key in local storage that isn\'t known: '${ testName }'. This may cause inconsistent A/B test behaviour, please check this is okay and add it to 'knownABTestKeys' in default.config`;
						slackNotifier.warn( message, { suppressDuplicateMessages: true } );
					}
				}
			} );
	}
	setABTestControlGroupsInLocalStorage( url, culture = 'en', flow = 'main' ) {
		const overrideABTests = config.get( 'overrideABTests' );

		const expectedABTestValue = overrideABTests
			.map( entry => {
				return '"' + entry[ 0 ] + '":"' + entry[ 1 ] + '"';
			} )
			.join( ',' );

		this.driver.executeScript( 'window.localStorage.clear();' );

		this.driver.executeScript(
			`window.localStorage.setItem('ABTests','{${ expectedABTestValue }}');`
		);

		this.driver.executeScript( `window.localStorage.setItem('signupFlowName','"${ flow }"');` );

		this.driver.get( url );

		this.driver.executeScript( 'return window.localStorage.signupFlowName;' ).then( flowValue => {
			assert.equal(
				flowValue,
				`"${ flow }"`,
				"The local storage value for flow wasn't set correctly"
			);
		} );

		this.driver.executeScript( 'return window.localStorage.ABTests;' ).then( abtestsValue => {
			if ( ! isEqual( JSON.parse( abtestsValue ), JSON.parse( `{${ expectedABTestValue }}` ) ) ) {
				const message = `The localstorage value for AB tests wasn't set correctly.\nExpected value is:\n'{${ expectedABTestValue }}'\nActual value is:\n'${ abtestsValue }'`;
				slackNotifier.warn( message, { suppressDuplicateMessages: true } );
			}
		} );

		return this.waitForPage();
	}
}
