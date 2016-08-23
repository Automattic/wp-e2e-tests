import test from 'selenium-webdriver/testing';
import config from 'config';
import SlackUpload from 'node-slack-upload';
import * as slackNotifier from './slack-notifier';
import fs from 'fs-extra';

import * as mediaHelper from './media-helper';

import * as driverManager from './driver-manager';
import * as driverHelper from './driver-helper';

const afterHookTimeoutMS = config.get( 'afterHookTimeoutMS' );
var allPassed = true; // For SauceLabs status

test.afterEach( 'Take Screenshot', function() {
	this.timeout( afterHookTimeoutMS );
	allPassed = allPassed && this.currentTest.state === 'passed';

	const driver = global.__BROWSER__;
	const longTestName = this.currentTest.fullTitle();
	const shortTestFileName = this.currentTest.title.replace( /[^a-z0-9]/gi, '-' ).toLowerCase();

	let screenSize;
	let orientation;
	if ( global.__MOBILE__ ) {
		screenSize = global.__originalScreenSize__;
		orientation = process.env.ORIENTATION || 'PORTRAIT';
	} else {
		screenSize = driverManager.currentScreenSize().toUpperCase();
	}

	if ( this.currentTest.state === 'failed' ) {
		let prefix;
		if ( global.__MOBILE__ ) {
			prefix = `FAILED-${screenSize}-${orientation}-${shortTestFileName}`;
		} else {
			prefix = `FAILED-${screenSize}-${shortTestFileName}`;
		}

		let neverSaveScreenshots = config.get( 'neverSaveScreenshots' );
		if ( neverSaveScreenshots ) {
			return null;
		}

		if ( global.__MOBILE__ ) {
			console.log( 'FAILED: Taking screenshot' );
		} else {
			driver.getCurrentUrl().then( ( url ) => console.log( `FAILED: Taking screenshot of: '${url}'` ), ( err ) => {
				slackNotifier.warn( `Could not capture the URL when taking a screenshot: '${err}'` );
			} );
		}

		return driver.takeScreenshot().then( ( data ) => {
			let screenshotPath = mediaHelper.writeScreenshot( data, prefix );

			if ( process.env.SLACK_TOKEN && process.env.CIRCLE_BRANCH === 'master' ) {
				let slackUpload = new SlackUpload( process.env.SLACK_TOKEN );

				slackUpload.uploadFile( {
					file: fs.createReadStream( screenshotPath ),
					title: `${longTestName} - # ${process.env.CIRCLE_BUILD_NUM}`,
					channels: '#e2eflowtesting-notif'
				}, function( err ) {
					if ( err ) {
						slackNotifier.warn( `Upload to slack failed: '${err}'` );
					} else {
						console.log( 'done' );
					}
				} );
			}
		}, ( err ) => {
			slackNotifier.warn( `Could not take screenshot due to error: '${err}'` );
		} );
	}
	if ( config.get( 'saveAllScreenshots' ) === true ) {
		let prefix;
		if ( global.__MOBILE__ ) {
			prefix = `PASSED-${screenSize}-${orientation}-${shortTestFileName}`;
		} else {
			prefix = `PASSED-${screenSize}-${shortTestFileName}`;
		}
		return driver.takeScreenshot().then( ( data ) => {
			mediaHelper.writeScreenshot( data, prefix );
		}, ( err ) => {
			slackNotifier.warn( `Could not take screenshot due to error: '${err}'` );
		} );
	}
} );

test.afterEach( 'Dismiss any alerts for switching away', function() {
	this.timeout( afterHookTimeoutMS );
	const driver = global.__BROWSER__;

	if ( ! global.__MOBILE__ && ( this.currentTest.state === 'failed' ) && ( config.util.getEnv( 'NODE_ENV' ) === 'test' ) ) {
		driverManager.dismissAllAlerts( driver );
	}
} );

test.afterEach( 'Check for console errors', function() {
	if ( global.__MOBILE__ ) {
		return;
	}

	this.timeout( afterHookTimeoutMS );
	const driver = global.__BROWSER__;
	return driverHelper.checkForConsoleErrors( driver );
} );

test.afterEach( 'Update Sauce Job Status locally', function() {
	const driver = global.__BROWSER__;

	if ( config.has( 'sauce' ) && config.get( 'sauce' ) ) {
		driver.allPassed = driver.allPassed && this.currentTest.state === 'passed'
	}
} );

test.after( 'Push SauceLabs job status update (if applicable)', function() {
	this.timeout( afterHookTimeoutMS );
	const driver = global.__BROWSER__;

	if ( global.__MOBILE__ ) {
		const wdDriver = global.__WDDRIVER__;

		if ( config.has( 'sauce' ) && config.get( 'sauce' ) ) {
			return wdDriver.sauceJobStatus( allPassed );
		}
	}

	// Non-mobile
	if ( config.has( 'sauce' ) && config.get( 'sauce' ) ) {
		driver.executeScript( 'sauce:job-result=' + driver.allPassed )
	}
} );

test.after( 'Quit browser', function() {
	this.timeout( afterHookTimeoutMS );
	const driver = global.__BROWSER__;

	if ( ( config.has( 'sauce' ) && config.get( 'sauce' ) ) || config.util.getEnv( 'NODE_ENV' ) === 'test' ) {
		return driverManager.quitBrowser( driver );
	}

	// For mobile non-SauceLabs runs, force orientation back to Portrait to prevent issues re-using the emulator for later tests -- TODO re-evaluate this...
	if ( global.__MOBILE__ ) {
		const wdDriver = global.__WDDRIVER__;
		return wdDriver.setOrientation( 'PORTRAIT' ).then( function() {
			if ( config.util.getEnv( 'NODE_ENV' ) !== 'development' ) {
				return driverManager.quitBrowser( driver );
			}
		} );
	}
} );
