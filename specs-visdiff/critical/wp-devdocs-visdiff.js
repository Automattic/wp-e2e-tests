import test from 'selenium-webdriver/testing';
import config from 'config';
import * as driverManager from '../../lib/driver-manager.js';
import * as driverHelper from '../../lib/driver-helper.js';
import * as slackNotifier from '../../lib/slack-notifier';

import LoginFlow from '../../lib/flows/login-flow.js';

import DevdocsDesignPage from '../../lib/pages/devdocs-design-page.js';

const mochaVisDiffTimeOut = config.get( 'mochaVisDiffTimeoutMS' );
const mochaDevDocsTimeOut = config.get( 'mochaDevDocsTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );

import webdriver from 'selenium-webdriver';
const by = webdriver.By;

let driver, screenSize, screenSizeName;
screenSizeName = driverManager.currentScreenSize();

let Eyes = require( 'eyes.selenium' ).Eyes;
let eyes = new Eyes();
eyes.setApiKey( config.get( 'eyesKey' ) );
eyes.setForceFullPageScreenshot( true );

if ( process.env.CIRCLE_BUILD_NUM ) {
	eyes.setBatch( `wp-e2e-tests #${process.env.CIRCLE_BUILD_NUM}`, process.env.CIRCLE_BUILD_NUM );
}

test.before( function() {
	console.log( 'First test.before() in wp-devdocs-visdiff.js' );
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
	screenSize = driverManager.getSizeAsObject();
} );

test.describe( 'DevDocs Visual Diff (' + screenSizeName + ')', function() {
	var devdocsDesignPage;
	console.log( 'Beginning DevDocs visdiff' );
	this.timeout( mochaDevDocsTimeOut );

	test.before( function() {
		var timer;

		console.log( 'Second test.before() in wp-devdocs-visdiff.js, about to open eyes object' );
		eyes.open( driver, 'WordPress.com', 'DevDocs Design [' + screenSizeName + ']', screenSize ).then( function() {
			console.log( 'The eyes object is open' );
		} );

		let loginFlow = new LoginFlow( driver );
		loginFlow.login().then( function() {
			console.log( 'Logged in' );
			timer = setTimeout( function() {
				console.log( 'DevDocs Page failed to load in time, calling window.stop()' );
				driver.executeScript( 'window.stop()' );
			}, 45000 );
		} );

		devdocsDesignPage = new DevdocsDesignPage( driver, true );
		driver.wait( devdocsDesignPage.displayed(), mochaVisDiffTimeOut ).then( function() {
			console.log( 'Design Page Loaded' );
			clearTimeout( timer );
		} );
	} );

	test.it( 'Verify UI Components', function() {
		this.timeout( mochaDevDocsTimeOut );
		devdocsDesignPage.openUIComponents().then( function() {
			devdocsDesignPage.getAllDesignElements().then( function( elements ) {
				// Screenshot each element individually to avoid Applitools page size restrictions
				for ( const el of elements ) {
					// Retrieve the name of the element, and the "Compact" button if available
					el.findElements( by.css( 'h2 a' ) ).then( function( anchors ) {
						// Two anchors means there's a "Compact" option
						if ( anchors.length === 2 ) {
							anchors[0].getInnerHtml().then( function( name ) {
								driverHelper.eyesScreenshot( driver, eyes, name + ' (Full)', el );
								anchors[1].click().then( function() {
									driverHelper.eyesScreenshot( driver, eyes, name + ' (Compact)', el );
								} );
							} );
						} else if ( anchors.length === 1 ) {
							anchors[0].getInnerHtml().then( function( name ) {
								driverHelper.eyesScreenshot( driver, eyes, name, el );
							} );
						} else if ( anchors.length === 0 ) { // wp-calypso issue #4079, but could recur, so I'm leaving the check
							el.findElement( by.css( 'h2' ) ).then( function( h2 ) {
								h2.getInnerHtml().then( function( name ) {
									driverHelper.eyesScreenshot( driver, eyes, name, el );
								} );
							} );
						} else {
							throw new Error( 'Unexpected number of "h2 a" tags in Design Element' );
						}
					} );
				}
			} );
		} );
	} );

	test.it( 'Verify Typography', function() {
		devdocsDesignPage.openTypography().then( function() {
			driverHelper.eyesScreenshot( driver, eyes, 'DevDocs Design (Typography)' );
		} );
	} );

	test.it( 'Verify App Components', function() {
		devdocsDesignPage.openAppComponents().then( function() {
			driverHelper.eyesScreenshot( driver, eyes, 'DevDocs Design (App Components)' );
		} );
	} );

	test.after( function() {
		try {
			eyes.close( false ).then( function( testResults ) {
				let message = '';

				if ( testResults.mismatches ) {
                                        message = `<!here> Visual diff failed with ${testResults.mismatches} mismatches - ${testResults.url}`;
				} else if ( testResults.missing ) {
					message = `<!here> Visual diff failed with ${testResults.missing} missing steps out of ${testResults.steps} - ${testResults.url}`;
				} else if ( testResults.isNew ) {
					message = `<!here> Visual diff marked as failed because it is a new baseline - ${testResults.url}`;
				}

				if ( message !== '' ) {
					slackNotifier.warn( message );
				}
			} );
		} finally {
			eyes.abortIfNotClosed();
		}
	} );
} );

test.after( function() {
	eyes.abortIfNotClosed();
} );
