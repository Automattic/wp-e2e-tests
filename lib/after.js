import test from 'selenium-webdriver/testing';
import config from 'config';
import SlackUpload from 'node-slack-upload';
import fs from 'fs-extra';

import * as mediaHelper from './media-helper';

import * as driverManager from './driver-manager';

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

test.afterEach( '', function() {
	this.timeout( afterHookTimeoutMS );
	const driver = global.__BROWSER__;

	if ( ( this.currentTest.state === 'failed' ) && ( config.util.getEnv( 'NODE_ENV' ) === 'test' ) ) {
		driver.get( 'data:,' );

		driver.switchTo().alert().then( function( alert ) {
			alert.accept();
		}, function( error ) { } );
	}
} );

test.afterEach( 'Capture Logs on Failure', function() {
	this.timeout( afterHookTimeoutMS );
	const driver = global.__BROWSER__;

	if ( this.currentTest.state === 'failed'  && ! ( config.has( 'sauce' ) && config.get( 'sauce' ) ) ) {
		driver.manage().logs().get( 'browser' ).then( function( logs ) {
			let location = mediaHelper.writeTextLogFile( JSON.stringify( logs ), 'failed-test' );
			console.log( `BROWSER Logs saved to: '${location}'` );
		} );
	}
} );

test.afterEach( 'Update Sauce Job Status', function() {
	const driver = global.__BROWSER__;

	if ( config.has( 'sauce' ) && config.get( 'sauce' ) ) {
		driver.allPassed = driver.allPassed && this.currentTest.state === 'passed'
	}
} );

test.after( function() {
	this.timeout( afterHookTimeoutMS );
	const driver = global.__BROWSER__;

	if ( config.has( 'sauce' ) && config.get( 'sauce' ) ) {
		driver.executeScript( "sauce:job-result=" + driver.allPassed ) 
	}

	if ( config.util.getEnv( 'NODE_ENV' ) === 'test' ) {
		driverManager.quitBrowser( driver );
	}
} );
