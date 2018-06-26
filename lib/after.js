/** @format */

import test from 'selenium-webdriver/testing';
import config from 'config';
import * as slackNotifier from './slack-notifier';

import * as mediaHelper from './media-helper';

import * as driverManager from './driver-manager';
import * as driverHelper from './driver-helper';

const afterHookTimeoutMS = config.get( 'afterHookTimeoutMS' );
let allPassed = true; // For SauceLabs status

// Sauce Breakpoint
test.afterEach( async function() {
	this.timeout( afterHookTimeoutMS );
	const driver = global.__BROWSER__;

	if (
		process.env.SAUCEDEBUG &&
		this.currentTest.state === 'failed' &&
		config.has( 'sauce' ) &&
		config.get( 'sauce' )
	) {
		await driver.executeScript( 'sauce: break' );
	}
} );

// Take Screenshot
test.afterEach( async function() {
	this.timeout( afterHookTimeoutMS );
	if ( ! await this.currentTest ) {
		return;
	}
	allPassed = allPassed && ( await this.currentTest.state ) === 'passed';

	const driver = global.__BROWSER__;
	const shortTestFileName = await this.currentTest.title
		.replace( /[^a-z0-9]/gi, '-' )
		.toLowerCase();
	const shortDescribeFileName = await this.currentTest
		.fullTitle()
		.replace( /.*\)/gi, '' )
		.replace( /\@.*/gi, '' )
		.replace( /[^a-z0-9]/gi, '-' )
		.toLowerCase();

	const screenSize = await driverManager.currentScreenSize().toUpperCase();
	const locale = await driverManager.currentLocale().toUpperCase();
	const date = new Date().getTime().toString();
	let filenameCallback;

	if ( ( await this.currentTest.state ) === 'failed' ) {
		let neverSaveScreenshots = config.get( 'neverSaveScreenshots' );
		if ( neverSaveScreenshots ) {
			return null;
		}

		await driver.getCurrentUrl().then(
			url => console.log( `FAILED: Taking screenshot of: '${ url }'` ),
			err => {
				slackNotifier.warn( `Could not capture the URL when taking a screenshot: '${ err }'` );
			}
		);

		filenameCallback = () => `FAILED-${ locale }-${ screenSize }-${ shortTestFileName }-${ date }`;
	} else if ( config.get( 'saveAllScreenshots' ) === true ) {
		filenameCallback = () =>
			`${ locale }-${ screenSize }-${ shortDescribeFileName }-${ date }-${ shortTestFileName }`;
	} else {
		return;
	}

	return driver.takeScreenshot().then(
		data => {
			return driver.getCurrentUrl().then( url => {
				return mediaHelper.writeScreenshot( data, filenameCallback, { url } );
			} );
		},
		err => {
			slackNotifier.warn( `Could not take screenshot due to error: '${ err }'` );
		}
	);
} );

// Dismiss any alerts for switching away
test.afterEach( async function() {
	this.timeout( afterHookTimeoutMS );
	const driver = global.__BROWSER__;

	if (
		this.currentTest.state === 'failed' &&
		( config.get( 'closeBrowserOnComplete' ) === true || global.isHeadless === true )
	) {
		await driverManager.dismissAllAlerts( driver );
	}
} );

// Check for console errors
test.afterEach( async function() {
	this.timeout( afterHookTimeoutMS );
	const driver = global.__BROWSER__;
	return await driverHelper.checkForConsoleErrors( driver );
} );

// Update Sauce Job Status locally
test.afterEach( async function() {
	const driver = global.__BROWSER__;

	if ( config.has( 'sauce' ) && config.get( 'sauce' ) ) {
		driver.allPassed = driver.allPassed && this.currentTest.state === 'passed';
	}
} );

// Push SauceLabs job status update (if applicable)
test.after( async function() {
	this.timeout( afterHookTimeoutMS );
	const driver = global.__BROWSER__;

	if ( config.has( 'sauce' ) && config.get( 'sauce' ) ) {
		await driver.executeScript( 'sauce:job-result=' + driver.allPassed );
	}
} );

// Quit browser
test.after( async function() {
	this.timeout( afterHookTimeoutMS );
	const driver = global.__BROWSER__;

	if (
		( config.has( 'sauce' ) && config.get( 'sauce' ) ) ||
		config.get( 'closeBrowserOnComplete' ) === true ||
		global.isHeadless === true
	) {
		return await driverManager.quitBrowser( driver );
	}
} );
