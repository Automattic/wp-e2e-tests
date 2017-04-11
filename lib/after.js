import test from 'selenium-webdriver/testing';
import config from 'config';
import SlackUpload from 'node-slack-upload';
import * as slackNotifier from './slack-notifier';
import fs from 'fs-extra';

import * as mediaHelper from './media-helper';

import * as driverManager from './driver-manager';
import * as driverHelper from './driver-helper';

const afterHookTimeoutMS = config.get( 'afterHookTimeoutMS' );
let allPassed = true; // For SauceLabs status

// Sauce Breakpoint
test.afterEach( function() {
	const driver = global.__BROWSER__;

	if ( process.env.SAUCEDEBUG && this.currentTest.state === 'failed' && config.has( 'sauce' ) && config.get( 'sauce' ) ) {
		driver.executeScript( 'sauce: break' );
	}
} );

// Take Screenshot
test.afterEach( function() {
	this.timeout( afterHookTimeoutMS );
	if ( ! this.currentTest ) {
		return;
	}
	allPassed = allPassed && this.currentTest.state === 'passed';

	const driver = global.__BROWSER__;
	const longTestName = this.currentTest.fullTitle();
	const shortTestFileName = this.currentTest.title.replace( /[^a-z0-9]/gi, '-' ).toLowerCase();

	const screenSize = driverManager.currentScreenSize().toUpperCase();

	if ( this.currentTest.state === 'failed' ) {
		const prefix = `FAILED-${screenSize}-${shortTestFileName}`;

		let neverSaveScreenshots = config.get( 'neverSaveScreenshots' );
		if ( neverSaveScreenshots ) {
			return null;
		}

		driver.getCurrentUrl().then( ( url ) => console.log( `FAILED: Taking screenshot of: '${url}'` ), ( err ) => {
			slackNotifier.warn( `Could not capture the URL when taking a screenshot: '${err}'` );
		} );

		return driver.takeScreenshot().then( ( data ) => {
			let screenshotPath = mediaHelper.writeScreenshot( data, prefix );

			if ( config.has( 'slackTokenForScreenshots' ) && config.get( 'slackTokenForScreenshots' ) && process.env.CIRCLE_BRANCH === 'try/circle-ci-2.0' ) {
				let slackUpload = new SlackUpload( config.get( 'slackTokenForScreenshots' ) );

				slackUpload.uploadFile( {
					file: fs.createReadStream( screenshotPath ),
					title: `${longTestName} - # ${process.env.CIRCLE_BUILD_NUM}`,
					channels: config.get( 'slackChannelForScreenshots' )
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
		const prefix = `PASSED-${screenSize}-${shortTestFileName}`;
		return driver.takeScreenshot().then( ( data ) => {
			mediaHelper.writeScreenshot( data, prefix );
		}, ( err ) => {
			slackNotifier.warn( `Could not take screenshot due to error: '${err}'` );
		} );
	}
} );

// Dismiss any alerts for switching away
test.afterEach( function() {
	this.timeout( afterHookTimeoutMS );
	const driver = global.__BROWSER__;

	if ( ( this.currentTest.state === 'failed' && ( config.get( 'closeBrowserOnComplete' ) === true ) ) ) {
		driverManager.dismissAllAlerts( driver );
	}
} );

// Check for console errors
test.afterEach( function() {
	this.timeout( afterHookTimeoutMS );
	const driver = global.__BROWSER__;
	return driverHelper.checkForConsoleErrors( driver );
} );

// Update Sauce Job Status locally
test.afterEach( function() {
	const driver = global.__BROWSER__;

	if ( config.has( 'sauce' ) && config.get( 'sauce' ) ) {
		driver.allPassed = driver.allPassed && this.currentTest.state === 'passed'
	}
} );

// Push SauceLabs job status update (if applicable)
test.after( function() {
	this.timeout( afterHookTimeoutMS );
	const driver = global.__BROWSER__;

	if ( config.has( 'sauce' ) && config.get( 'sauce' ) ) {
		driver.executeScript( 'sauce:job-result=' + driver.allPassed )
	}
} );

// Quit browser
test.after( function() {
	this.timeout( afterHookTimeoutMS );
	const driver = global.__BROWSER__;

	if ( ( config.has( 'sauce' ) && config.get( 'sauce' ) ) || config.get( 'closeBrowserOnComplete' ) === true ) {
		return driverManager.quitBrowser( driver );
	}
} );
