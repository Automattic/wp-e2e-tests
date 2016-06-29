import test from 'selenium-webdriver/testing';
import config from 'config';
import SlackUpload from 'node-slack-upload';
import fs from 'fs-extra';

import * as mediaHelper from './media-helper';

import * as driverManager from './driver-manager';
import * as driverHelper from './driver-helper';

const afterHookTimeoutMS = config.get( 'afterHookTimeoutMS' );

test.afterEach( 'Take Screenshot', function() {
	this.timeout( afterHookTimeoutMS );

	const driver = global.__BROWSER__;
	const longTestName = this.currentTest.fullTitle();
	const shortTestFileName = this.currentTest.title.replace( /[^a-z0-9]/gi, '-' ).toLowerCase();
	const screenSize = driverManager.currentScreenSize().toUpperCase();

	if ( this.currentTest.state === 'failed' ) {
		const prefix = `FAILED-${screenSize}-${shortTestFileName}`;
		try {
			let neverSaveScreenshots = config.get( 'neverSaveScreenshots' );
			if ( neverSaveScreenshots ) {
				return null;
			}

			driver.getCurrentUrl().then( ( url ) => console.log( `FAILED: Taking screenshot of: '${url}'` ) );

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
							console.error( 'Upload failed: ' + err );
						} else {
							console.log( 'done' );
						}
					} );
				}
			} );
		} catch ( e ) {
			console.log( `Error when taking screenshot in base container: '${e}'` );
		}
	}
	if ( config.get( 'saveAllScreenshots' ) === true ) {
		const prefix = `PASSED-${screenSize}-${shortTestFileName}`;
		try {
			return driver.takeScreenshot().then( ( data ) => {
				mediaHelper.writeScreenshot( data, prefix );
			} );
		} catch ( e ) {
			console.log( `Error when taking screenshot in base container: '${e}'` );
		}
	}
} );

test.afterEach( 'Dismiss any alerts for switching away', function() {
	this.timeout( afterHookTimeoutMS );
	const driver = global.__BROWSER__;

	if ( ( this.currentTest.state === 'failed' ) && ( config.util.getEnv( 'NODE_ENV' ) === 'test' ) ) {
		driver.get( 'data:,' );

		driver.switchTo().alert().then( function( alert ) {
			alert.accept();
		}, function( error ) { } );
	}
} );

test.afterEach( 'Check for console errors', function() {
	this.timeout( afterHookTimeoutMS );
	const driver = global.__BROWSER__;

	return driverHelper.checkForConsoleErrors( driver );
} );

test.after( function() {
	this.timeout( afterHookTimeoutMS );
	if ( config.util.getEnv( 'NODE_ENV' ) === 'test' ) {
		driverManager.quitBrowser( global.__BROWSER__ );
	}
} );
