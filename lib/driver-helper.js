import webdriver from 'selenium-webdriver';
import config from 'config';
import * as driverManager from './driver-manager.js';
import {forEach} from 'lodash';
import * as SlackNotifier from './slack-notifier.js';

const explicitWaitMS = config.get( 'explicitWaitMS' );

export function highlightElement( driver, selector, waitOverride ) {
	if ( config.has( 'highlightElements' ) && config.get( 'highlightElements' ) ) {
		const timeoutWait = waitOverride ? waitOverride : explicitWaitMS;

		function setStyle( element, style ) {
			const previous = element.getAttribute( 'style' );
			element.setAttribute( 'style', style );
			setTimeout( () => {
				element.setAttribute( 'style', previous );
			}, 200 );
			return 'highlighted';
		}
		let theElement = driver.findElement( selector );
		return driver.wait( function() {
			return driver.executeScript( setStyle, theElement, 'color: red; background-color: yellow;' );
		}, timeoutWait, `Timed out waiting for element to be Highlighted` );
	}
}

export function clickWhenClickable( driver, selector, waitOverride ) {
	const timeoutWait = waitOverride ? waitOverride : explicitWaitMS;

	this.highlightElement( driver, selector, waitOverride );
	return driver.wait( function() {
		return driver.findElement( selector ).then( function( element ) {
			return element.click().then( function() {
				return true;
			}, function() {
				return false;
			} );
		}, function() {
			return false;
		} );
	}, timeoutWait, `Timed out waiting for element with ${selector.using} of '${selector.value}' to be clickable` );
}

export function clickWhenClickableMobile( driver, selector ) {
	var self = this;
	let d = webdriver.promise.defer();

	self.scrollToFindElement( driver, selector ).then( function( element ) {
		return element.click().then( function() {
			d.fulfill( true );
		}, function() {
			d.reject( false );
		} );
	}, function() {
		d.reject( false );
	} );

	return driver.wait( d.promise, explicitWaitMS, `Timed out waiting for element with ${selector.using} of '${selector.value}' to be clickable` );
}

export function waitTillPresentAndDisplayed( driver, selector, waitOverride ) {
	const timeoutWait = waitOverride ? waitOverride : explicitWaitMS;

	return driver.wait( function() {
		return driver.findElement( selector ).then( function( element ) {
			return element.isDisplayed().then( function() {
				return true;
			}, function() {
				return false;
			} );
		}, function() {
			return false;
		} );
	}, timeoutWait, `Timed out waiting for element with ${selector.using} of '${selector.value}' to be present and displayed` );
}

export function isEventuallyPresentAndDisplayed( driver, selector, waitOverride ) {
	const timeoutWait = waitOverride ? waitOverride : explicitWaitMS;

	return driver.wait( function() {
		return driver.findElement( selector ).then( function( element ) {
			return element.isDisplayed().then( function() {
				return true;
			}, function() {
				return false;
			} );
		}, function() {
			return false;
		} );
	}, timeoutWait ).then( ( shown ) => {
		return shown;
	}, ( ) => {
		return false
	} );
}

export function clickIfPresent( driver, selector, attempts ) {
	if ( attempts === undefined ) {
		attempts = 1;
	}
	for ( let x = 0; x < attempts; x++ ) {
		driver.findElement( selector ).then( function( element ) {
			element.click().then( function() {
				return true;
			}, function() {
				return true;
			} );
		}, function() {
			return true;
		} );
	}
}

export function clickIfPresentMobile( driver, selector, attempts ) {
	if ( attempts === undefined ) {
		attempts = 1;
	}
	for ( let x = 0; x < attempts; x++ ) {
		this.scrollToFindElement( driver, selector ).then( function( element ) {
			element.click().then( function() {
				return true;
			}, function() {
				return true;
			} );
		}, function() {
			return true;
		} );
	}
}

export function waitForFieldClearable( driver, selector ) {
	return driver.wait( function() {
		return driver.findElement( selector ).then( ( element ) => {
			return element.clear().then( function() {
				return element.getAttribute( 'value' ).then( ( value ) => {
					return value === '';
				} );
			}, function() {
				return false;
			} );
		}, function() {
			return false;
		} );
	}, explicitWaitMS, `Timed out waiting for element with ${selector.using} of '${selector.value}' to be clearable` );
}

export function waitForFieldClearableMobile( driver, selector ) {
	var self = this;
	let d = webdriver.promise.defer();

	self.scrollToFindElement( driver, selector ).then( ( element ) => {
		return element.clear().then( function() {
			d.fulfill();
		} );
	}, function() {
		d.reject();
	} );

	return driver.wait( d.promise, explicitWaitMS, `Timed out waiting for element with ${selector.using} of '${selector.value}' to be clearable` );
}

export function setWhenSettable( driver, selector, value, { secureValue = false } = {} ) {
	const logValue = secureValue === true ? '*********' : value;
	let self = this;
	return driver.wait( function() {
		return driver.findElement( selector ).then( function( element ) {
			self.waitForFieldClearable( driver, selector );
			return element.sendKeys( value ).then( function() {
				return element.getAttribute( 'value' ).then( ( actualValue ) => {
					return actualValue === value;
				} );
			}, function() {
				return false;
			} );
		}, function() {
			return false;
		} );
	}, explicitWaitMS, `Timed out waiting for element with ${selector.using} of '${selector.value}' to be settable to: '${logValue}'` );
}

export function setWhenSettableMobile( driver, selector, value, { secureValue = false } = {} ) {
	const logValue = secureValue === true ? '*********' : value;
	let self = this;
	let d = webdriver.promise.defer();

	self.scrollToFindElement( driver, selector ).then( function( element ) {
		return self.waitForFieldClearableMobile( driver, selector ).then( function() {
			return element.sendKeys( value ).then( function() {
				d.fulfill();
			} );
		} );
	}, function() {
		d.reject();
	} );

	return driver.wait( d.promise, explicitWaitMS, `Timed out waiting for element with ${selector.using} of '${selector.value}' to be settable to: '${logValue}'` );
}

/**
 * Check whether an image is actually visible - that is rendered to the screen - not just having a reference in the DOM
 * @param {webdriver} driver - Browser context in which to search
 * @param {WebElement} webElement - Element to search for
 * @returns {Promise} - Resolved when the script is done executing
 */
export function imageVisible( driver, webElement ) {
	return driver.executeScript( 'return (typeof arguments[0].naturalWidth!=\"undefined\" && arguments[0].naturalWidth>0)', webElement );
}

export function checkForConsoleErrors( driver ) {
	if ( config.get( 'checkForConsoleErrors' ) === true ) {
		driver.manage().logs().get( 'browser' ).then( function( logs ) {
			if ( logs.length > 0 ) {
				forEach( logs, ( log ) => {
					// Ignore chrome cast errors in Chrome - http://stackoverflow.com/questions/24490323/google-chrome-cast-sender-error-if-chrome-cast-extension-is-not-installed-or-usi/26095117#26095117
					// Also ignore post message errors - this is a known limitation at present
					// Also ignore 404 errors for viewing sites or posts/pages that are private
					if ( ( log.message.indexOf( 'cast_sender.js' ) === -1 ) && ( log.message.indexOf( '404' ) === -1 ) && ( log.message.indexOf( 'Failed to execute \'postMessage\' on \'DOMWindow\'' ) === -1 ) ) {
						driver.getCurrentUrl().then( ( url ) => {
							SlackNotifier.warn( `Found console error: "${log.message}" on url '${url}'`, { suppressDuplicateMessages: true } );
						} );
					}
				} );
			}
		} );
	}
}

export function eyesScreenshot( driver, eyes, pageName, selector ) {
	let browserName = global.browserName || 'chrome';
	console.log( `eyesScreenshot - ${pageName} - [${browserName}][${driverManager.currentScreenSize()}]` );

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

/**
 * Scroll through the page looking for a given element
 * @param {webdriver} driver - Selenium browser object
 * @param {selector} selector - webdriver.By selector we're searching for
 * @param {integer} maxSwipes - Maximum number of times to try and scroll through the screen
 * @returns {Promise} - Resolved when the element is found, or maxSwipes is reached
 */
export function scrollToFindElement( driver, selector, { maxSwipes = 2 } = {} ) {
	var wdDriver = global.__WDDRIVER__;
	var d = webdriver.promise.defer();
	var executeSearch;

	var swipeAndRetry = function( swipeNum ) {
		wdDriver.execute( 'mobile: scroll', [ {direction: 'down'} ] ).then( function() {
			executeSearch( swipeNum - 1 );
		} );
	};

	executeSearch = function( swipeNum ) {
		driver.findElement( selector ).then( function success( el ) {
			return el.isDisplayed().then( function( visible ) {
				if ( visible ) {
					d.fulfill( el );
				} else {
					swipeAndRetry( swipeNum );
				}
			} );
		}, function failure() {
			if ( swipeNum <= 0 ) {
				d.reject( -1 );
			} else {
				swipeAndRetry( swipeNum );
			}
		} );
	};

	executeSearch( maxSwipes );

	return d.promise;
}
