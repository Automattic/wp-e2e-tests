import assert from 'assert';
import config from 'config';
import * as driverManager from './driver-manager.js';
import * as mediaHelper from './media-helper';
import * as slackNotifier from '../lib/slack-notifier';

export function eyesSetup( fullPageScreenshot ) {
	let Eyes = require( 'eyes.selenium' ).Eyes;
	let eyes = new Eyes();
	eyes.setApiKey( config.get( 'eyesKey' ) );
	if ( fullPageScreenshot ) {
		eyes.setForceFullPageScreenshot( true );
	}

	return eyes;
}

export function eyesOpen( driver, eyes, testEnvironment, testName ) {
	let screenSize = driverManager.getSizeAsObject();
	let batchName = '';
	if ( process.env.CIRCLE_BUILD_NUM ) {
		batchName = `wp-e2e-tests-visdiff [${global.browserName}] #${process.env.CIRCLE_BUILD_NUM}`
	}

	if ( batchName !== '' ) {
		eyes.setBatch( batchName, `wp-e2e-tests-visdiff-${global.browserName}-${process.env.CIRCLE_BUILD_NUM}` );
	}

	if ( ! process.env.EYESDEBUG ) {
		eyes.open( driver, testEnvironment, testName, screenSize );
	}
}

export function eyesClose( eyes ) {
	if ( ! process.env.EYESDEBUG ) {
		try {
			eyes.close( false ).then( function( testResults ) {
				let message = '';

				if ( testResults.mismatches ) {
					message = `<!subteam^S0G7K98MB|flow-patrol-squad-team> Visual diff failed with ${testResults.mismatches} mismatches - ${testResults.appUrls.session}`;
				} else if ( testResults.missing ) {
					message = `<!subteam^S0G7K98MB|flow-patrol-squad-team> Visual diff failed with ${testResults.missing} missing steps out of ${testResults.steps} - ${testResults.appUrls.session}`;
				} else if ( testResults.isNew ) {
					message = `<!subteam^S0G7K98MB|flow-patrol-squad-team> Visual diff marked as failed because it is a new baseline - ${testResults.appUrls.session}`;
				}

				if ( message !== '' ) {
					slackNotifier.warn( message );
					if ( config.has( 'failVisdiffs' ) && config.get( 'failVisdiffs' ) ) {
						assert( false, message );
					}
				}
			} );
		} finally {
			eyes.abortIfNotClosed();
		}
	}
}

export function eyesScreenshot( driver, eyes, pageName, selector ) {
	let browserName = global.browserName || 'chrome';
	console.log( `eyesScreenshot - ${pageName} - [${browserName}][${driverManager.currentScreenSize()}]` );

	if ( process.env.EYESDEBUG ) {
		return driver.takeScreenshot().then( ( data ) => {
			mediaHelper.writeScreenshot( data, `EYES-${pageName}-${driverManager.currentScreenSize()}` );
		} );
	}

	// Remove focus to avoid blinking cursors in input fields
	// -- Works in Firefox, but not Chrome, at least on OSX I believe due to a
	// lack of "raw WebKit events".  It may work on Linux with CircleCI
	return driver.executeScript( 'document.activeElement.blur()' ).then( function() {
		if ( selector ) {
			// If this is a webdriver.By selector
			if ( selector.using ) {
				return eyes.checkRegionBy( selector, pageName );
			}

			return eyes.checkRegionByElement( selector, pageName );
		}

		return eyes.checkWindow( pageName );
	} );
}
