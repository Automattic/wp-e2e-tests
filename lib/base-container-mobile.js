import webdriver from 'selenium-webdriver';
import config from 'config';

import * as mediaHelper from './media-helper';
import * as driverHelper from './driver-helper';

const until = webdriver.until;

export default class BaseContainerMobile {
	constructor( driver, expectedElementSelector, packageName = 'org.wordpress.android' ) {
		this.driver = driver;
		this.explicitWaitMS = config.get( 'explicitWaitMS' );
		this.expectedElementSelector = expectedElementSelector;
		this.packageName = packageName;
		this.waitForPage();
	}

	takeScreenShot() {
		if ( config.get( 'saveAllScreenshots' ) === true ) {
			const prefix = ``; // TODO: Maybe have driver-manager return the device name for prefix?
			try {
				return this.driver.takeScreenshot().then( ( data ) => {
					mediaHelper.writeScreenshot( data, prefix );
				} );
			} catch ( e ) {
				console.log( `Error when taking screenshot in base container: '${e}'` );
			}
		}
	}

	waitForPage() {
		this.driver.wait( until.elementLocated( this.expectedElementSelector ), this.explicitWaitMS, 'Could not locate the ' + this.expectedElementSelector.value + ' element. Check that is is displayed.' );
	}

	displayed() {
		return driverHelper.isElementPresent( this.driver, this.expectedElementSelector );
	}
}
