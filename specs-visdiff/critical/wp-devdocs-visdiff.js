import test from 'selenium-webdriver/testing';
import config from 'config';
import * as driverManager from '../../lib/driver-manager.js';
import * as driverHelper from '../../lib/driver-helper.js';
import * as slackNotifier from '../../lib/slack-notifier';

import LoginFlow from '../../lib/flows/login-flow.js';

import DevdocsDesignPage from '../../lib/pages/devdocs-design-page.js';

import webdriver from 'selenium-webdriver';
const by = webdriver.By;

let mochaDevDocsTimeOut = config.get( 'mochaDevDocsTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );

let driver, screenSize, screenSizeName;
screenSizeName = driverManager.currentScreenSize();

let Eyes = require( 'eyes.selenium' ).Eyes;
let eyes = new Eyes();
eyes.setApiKey( config.get( 'eyesKey' ) );
eyes.setForceFullPageScreenshot( true );
let batchName = '';
let crossBrowser = false;

if ( process.env.CIRCLE_BUILD_NUM ) {
	batchName = `wp-e2e-tests #${process.env.CIRCLE_BUILD_NUM}`
}

if ( config.has( 'crossBrowser' ) && config.get( 'crossBrowser' ) ) {
	batchName = `Cross Browser Diffs #${process.env.CIRCLE_BUILD_NUM}`
	crossBrowser = true;
	mochaDevDocsTimeOut *= 3;
}

if ( batchName !== '' ) {
	eyes.setBatch( batchName, 'wp-e2e-tests-' + process.env.CIRCLE_BUILD_NUM );
}

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser( false ); // Start browser with default UA string
	screenSize = driverManager.getSizeAsObject();
} );

test.describe( 'DevDocs Visual Diff (' + screenSizeName + ')', function() {
	var devdocsDesignPage;
	this.timeout( mochaDevDocsTimeOut );

	test.before( function() {
		let testName = `DevDocs Design [${screenSizeName}]`;
		if ( crossBrowser ) {
			eyes.setHideScrollbars( true )
			eyes.setBaselineName( `devdocs-cross-browser-${screenSizeName}` );
			eyes.setMatchLevel( 'LAYOUT2' );
			testName = `DevDocs Cross-Browser [${screenSizeName}]`;
		}

		eyes.open( driver, 'WordPress.com', testName, screenSize );
		let loginFlow = new LoginFlow( driver );
		loginFlow.login();

		devdocsDesignPage = new DevdocsDesignPage( driver, true );
		return devdocsDesignPage.displayed();
	} );

	test.it( 'Verify UI Components', function() {
		this.timeout( mochaDevDocsTimeOut * 2 );
		devdocsDesignPage.openUIComponents().then( function() {
			devdocsDesignPage.getAllDesignElementLinks().then( function( hrefs ) {
				let flow = driver.controlFlow();

				for ( const href of hrefs ) {
					let title;

					// Open the design element
					flow.execute( function() {
						let titleSplit = href.split( '/' );
						title = titleSplit[ titleSplit.length - 1 ];
						return driver.get( href );
					} );
					// Hide the masterbar for clean CSS stitching
					flow.execute( function() {
						return devdocsDesignPage.hideMasterbar();
					} );
					// Take the screenshot
					flow.execute( function() {
						return driverHelper.eyesScreenshot( driver, eyes, title, by.id( 'primary' ) );
					} );
					// Check for Compact button
					flow.execute( function() {
						return devdocsDesignPage.isCurrentElementCompactable().then( function( compactable ) {
							if ( compactable ) {
								return devdocsDesignPage.getCurrentElementCompactButton().then( function( button ) {
									// Chrome needs a more precise click on the mobile width to avoid overlapping elements
									if ( global.browserName.toLowerCase() === 'chrome' ) {
										return driver.actions().mouseMove( button, {x: 3, y: 3} ).click().perform().then( function() {
											return driverHelper.eyesScreenshot( driver, eyes, title + ' (Compact)', by.id( 'primary' ) );
										} );
									}

									return button.click().then( function() {
										return driverHelper.eyesScreenshot( driver, eyes, title + ' (Compact)', by.id( 'primary' ) );
									} );
								} );
							}
						} );
					} );
				}
			} );
		} );
	} );

	test.it( 'Verify Typography', function() {
		devdocsDesignPage.openTypography().then( function() {
			devdocsDesignPage.hideMasterbar().then( function() {
				devdocsDesignPage.hideEnvironmentBadge().then( function() {
					driverHelper.eyesScreenshot( driver, eyes, 'DevDocs Design (Typography)', by.id( 'primary' ) );
				} );
			} );
		} );
	} );

	test.it( 'Verify Blocks Page', function() {
		devdocsDesignPage.openAppComponents().then( function() {
			devdocsDesignPage.hideMasterbar().then( function() {
				devdocsDesignPage.hideEnvironmentBadge().then( function() {
					slackNotifier.warn( 'The Blocks page is currently being ignored, pending wp-calypso/7257 resolution' );
					driverHelper.eyesScreenshot( driver, eyes, 'DevDocs Design (Blocks)', by.id( 'primary' ) );
				} );
			} );
		} );
	} );

	test.after( function() {
		try {
			eyes.close( false ).then( function( testResults ) {
				let message = '';

				if ( testResults.mismatches ) {
					message = `<!here> Visual diff failed with ${testResults.mismatches} mismatches - ${testResults.appUrls.session}`;
				} else if ( testResults.missing ) {
					message = `<!here> Visual diff failed with ${testResults.missing} missing steps out of ${testResults.steps} - ${testResults.appUrls.session}`;
				} else if ( testResults.isNew ) {
					message = `<!here> Visual diff marked as failed because it is a new baseline - ${testResults.appUrls.session}`;
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
