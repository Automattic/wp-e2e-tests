/** @format */

import config from 'config';
import assert from 'assert';
import { isEqual } from 'lodash';

import * as driverManager from './driver-manager';
import * as driverHelper from './driver-helper';
import * as slackNotifier from './slack-notifier';

export default class AsyncBaseContainer {
	constructor( driver, expectedElementSelector ) {
		this.driver = driver;
		this.screenSize = driverManager.currentScreenSize().toUpperCase();
		this.expectedElementSelector = expectedElementSelector;
	}

	async visitInit( url ) {
		this.url = url;
		await this.driver.get( this.url );
		return await this.expectInit();
	}

	async expectInit() {
		await this.waitForPage();
		await this.checkForUnknownABTestKeys();
		return await this.checkForConsoleErrors();
	}

	async waitForPage() {
		return await driverHelper.waitTillPresentAndDisplayed(
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

	async title() {
		return await this.driver.getTitle();
	}

	async urlDisplayed() {
		return await this.driver.getCurrentUrl();
	}

	async checkForConsoleErrors() {
		return await driverHelper.checkForConsoleErrors( this.driver );
	}

	async checkForUnknownABTestKeys() {
		const knownABTestKeys = config.get( 'knownABTestKeys' );

		return await this.driver
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
	async setABTestControlGroupsInLocalStorage( url, culture = 'en', flow = 'main' ) {
		const overrideABTests = config.get( 'overrideABTests' );

		const expectedABTestValue = overrideABTests
			.map( entry => {
				return '"' + entry[ 0 ] + '":"' + entry[ 1 ] + '"';
			} )
			.join( ',' );

		await this.driver.executeScript( 'window.localStorage.clear();' );

		await this.driver.executeScript(
			`window.localStorage.setItem('ABTests','{${ expectedABTestValue }}');`
		);

		await this.driver.executeScript(
			`window.localStorage.setItem('signupFlowName','"${ flow }"');`
		);

		await this.driver.get( url );

		let flowValue = await this.driver.executeScript( 'return window.localStorage.signupFlowName;' );
		assert.equal(
			flowValue,
			`"${ flow }"`,
			"The local storage value for flow wasn't set correctly"
		);

		let abtestsValue = await this.driver.executeScript( 'return window.localStorage.ABTests;' );
		if ( ! isEqual( JSON.parse( abtestsValue ), JSON.parse( `{${ expectedABTestValue }}` ) ) ) {
			const message = `The localstorage value for AB tests wasn't set correctly.\nExpected value is:\n'{${ expectedABTestValue }}'\nActual value is:\n'${ abtestsValue }'`;
			slackNotifier.warn( message, { suppressDuplicateMessages: true } );
		}

		return this.waitForPage();
	}
}
