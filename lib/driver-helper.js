import webdriver from 'selenium-webdriver';
import config from 'config';
import * as driverManager from './driver-manager.js';
import {forEach} from 'lodash';
import * as SlackNotifier from './slack-notifier.js';
import * as mediaHelper from './media-helper';

const explicitWaitMS = config.get( 'explicitWaitMS' );
const by = webdriver.By;

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
		}, timeoutWait, 'Timed out waiting for element to be Highlighted' );
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

export function followLinkWhenFollowable( driver, selector, waitOverride ) {
	const timeoutWait = waitOverride ? waitOverride : explicitWaitMS;
	return driver.wait( function() {
		return driver.findElement( selector ).then( function( element ) {
			return element.getAttribute( 'href' ).then( function( href ) {
				driver.get( href );
				return true;
			}, function() {
				return false;
			} );
		}, function() {
			return false;
		} );
	}, timeoutWait, `Timed out waiting for link with ${selector.using} of '${selector.value}' to be followable` );
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

export function isElementPresent( driver, selector ) {
	return driver.findElements( selector ).then( ( e ) => {
		return !!e.length;
	} );
}

export function getErrorMessageIfPresent( driver ) {
	const errorNoticeTextSelector = by.css( '.notice.is-error .notice__text' );

	return driver.findElement( errorNoticeTextSelector ).then( ( el ) => {
		return el.getText();
	}, () => {} );
}

export function elementIsNotPresent( driver, cssSelector ) {
	return this.isElementPresent( driver, by.css( cssSelector ) ).then( function( isPresent ) {
		return ! isPresent;
	} );
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

export function setWhenSettable( driver, selector, value, { secureValue = false, pauseBetweenKeysMS = 0 } = {} ) {
	const logValue = secureValue === true ? '*********' : value;
	let self = this;
	return driver.wait( function() {
		return driver.findElement( selector ).then( function( element ) {
			self.waitForFieldClearable( driver, selector );
			if ( pauseBetweenKeysMS === 0 ) {
				element.sendKeys( value );
			} else {
				for ( let i = 0; i < value.length; i++ ) {
					driver.sleep( pauseBetweenKeysMS ).then( () => {
						element.sendKeys( value[i] );
					} );
				}
			}
			return element.getAttribute( 'value' ).then( ( actualValue ) => {
				return actualValue === value;
			}, function() {
				return false;
			} );
		}, function() {
			return false;
		} );
	}, explicitWaitMS, `Timed out waiting for element with ${selector.using} of '${selector.value}' to be settable to: '${logValue}'` );
}

export function setCheckbox( driver, selector ) {
	return driver.findElement( selector ).then( ( checkbox ) => {
		checkbox.getAttribute( 'checked' ).then( ( checked ) => {
			if ( checked !== 'true' ) {
				return this.clickWhenClickable( driver, selector );
			}
		} );
	} );
}

export function unsetCheckbox( driver, selector ) {
	return driver.findElement( selector ).then( ( checkbox ) => {
		checkbox.getAttribute( 'checked' ).then( ( checked ) => {
			if ( checked === 'true' ) {
				return this.clickWhenClickable( driver, selector );
			}
		} );
	} );
}

export function waitTillNotPresent( driver, selector, waitOverride ) {
	const timeoutWait = waitOverride ? waitOverride : explicitWaitMS;
	let self = this;

	return driver.wait( function() {
		return self.isElementPresent( driver, selector ).then( function( isPresent ) {
			return ! isPresent;
		} );
	}, timeoutWait, `Timed out waiting for element with ${selector.using} of '${selector.value}' to NOT be present` );
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

export function ensureMobileMenuOpen( driver ) {
	const self = this;
	const mobileHeaderSelector = by.css( '.section-nav__mobile-header' );
	driver.findElement( mobileHeaderSelector ).isDisplayed().then( ( mobileDisplayed ) => {
		if ( mobileDisplayed ) {
			driver.findElement( by.css( '.section-nav' ) ).getAttribute( 'class' ).then( ( classNames ) => {
				if ( classNames.includes( 'is-open' ) === false ) {
					self.clickWhenClickable( driver, mobileHeaderSelector );
				}
			} );
		}
	} );
}
