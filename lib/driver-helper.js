/** @format */

import webdriver from 'selenium-webdriver';
import config from 'config';
import { forEach } from 'lodash';
import * as SlackNotifier from './slack-notifier.js';
import * as dataHelper from './data-helper';

const explicitWaitMS = config.get( 'explicitWaitMS' );
const by = webdriver.By;

export function clickWhenClickable( driver, selector, waitOverride ) {
	const timeoutWait = waitOverride ? waitOverride : explicitWaitMS;

	return driver.wait(
		function() {
			return driver.findElement( selector ).then(
				function( element ) {
					return element.click().then(
						function() {
							return true;
						},
						function() {
							// Flaky response back from IE, so assume success and hope for the best
							if ( global.browserName === 'Internet Explorer' ) {
								console.log(
									"WARNING: IE claims the click action failed, but we're proceeding anyway!"
								);
								return true;
							}

							return false;
						}
					);
				},
				function() {
					return false;
				}
			);
		},
		timeoutWait,
		`Timed out waiting for element with ${ selector.using } of '${
			selector.value
		}' to be clickable`
	);
}

export function followLinkWhenFollowable( driver, selector, waitOverride ) {
	const timeoutWait = waitOverride ? waitOverride : explicitWaitMS;
	return driver.wait(
		function() {
			return driver.findElement( selector ).then(
				function( element ) {
					return element.getAttribute( 'href' ).then(
						function( href ) {
							driver.get( href );
							return true;
						},
						function() {
							return false;
						}
					);
				},
				function() {
					return false;
				}
			);
		},
		timeoutWait,
		`Timed out waiting for link with ${ selector.using } of '${ selector.value }' to be followable`
	);
}

export function waitTillPresentAndDisplayed( driver, selector, waitOverride ) {
	const timeoutWait = waitOverride ? waitOverride : explicitWaitMS;

	return driver.wait(
		function() {
			return driver.findElement( selector ).then(
				function( element ) {
					return element.isDisplayed().then(
						function() {
							return true;
						},
						function() {
							return false;
						}
					);
				},
				function() {
					return false;
				}
			);
		},
		timeoutWait,
		`Timed out waiting for element with ${ selector.using } of '${
			selector.value
		}' to be present and displayed`
	);
}

export function isEventuallyPresentAndDisplayed( driver, selector, waitOverride ) {
	const timeoutWait = waitOverride ? waitOverride : explicitWaitMS;

	return driver
		.wait( function() {
			return driver.findElement( selector ).then(
				function( element ) {
					return element.isDisplayed().then(
						function() {
							return true;
						},
						function() {
							return false;
						}
					);
				},
				function() {
					return false;
				}
			);
		}, timeoutWait )
		.then(
			shown => {
				return shown;
			},
			() => {
				return false;
			}
		);
}

export function clickIfPresent( driver, selector, attempts ) {
	if ( attempts === undefined ) {
		attempts = 1;
	}
	for ( let x = 0; x < attempts; x++ ) {
		driver.findElement( selector ).then(
			function( element ) {
				element.click().then(
					function() {
						return true;
					},
					function() {
						return true;
					}
				);
			},
			function() {
				return true;
			}
		);
	}
}

export async function isElementPresent( driver, selector ) {
	const elements = await driver.findElements( selector );
	return !! elements.length;
}

export function getErrorMessageIfPresent( driver ) {
	const errorNoticeTextSelector = by.css( '.notice.is-error .notice__text' );

	return driver.findElement( errorNoticeTextSelector ).then(
		el => {
			return el.getText();
		},
		() => {}
	);
}

export function elementIsNotPresent( driver, cssSelector ) {
	return this.isElementPresent( driver, by.css( cssSelector ) ).then( function( isPresent ) {
		return ! isPresent;
	} );
}

export async function waitForFieldClearable( driver, selector ) {
	return driver.wait(
		function() {
			return driver.findElement( selector ).then(
				element => {
					return element.clear().then(
						function() {
							return element.getAttribute( 'value' ).then( value => {
								return value === '';
							} );
						},
						function() {
							return false;
						}
					);
				},
				function() {
					return false;
				}
			);
		},
		explicitWaitMS,
		`Timed out waiting for element with ${ selector.using } of '${
			selector.value
		}' to be clearable`
	);
}

export async function setWhenSettable(
	driver,
	selector,
	value,
	{ secureValue = false, pauseBetweenKeysMS = 0 } = {}
) {
	const self = this;
	const logValue = secureValue === true ? '*********' : value;
	return driver.wait(
		async function() {
			await self.waitForFieldClearable( driver, selector );
			const element = await driver.findElement( selector );
			if ( pauseBetweenKeysMS === 0 ) {
				await element.sendKeys( value );
			} else {
				for ( let i = 0; i < value.length; i++ ) {
					await driver.sleep( pauseBetweenKeysMS );
					await element.sendKeys( value[ i ] );
				}
			}
			const actualValue = await element.getAttribute( 'value' );
			return actualValue === value;
		},
		explicitWaitMS,
		`Timed out waiting for element with ${ selector.using } of '${
			selector.value
		}' to be settable to: '${ logValue }'`
	);
}

export function setCheckbox( driver, selector ) {
	return driver.findElement( selector ).then( checkbox => {
		checkbox.getAttribute( 'checked' ).then( checked => {
			if ( checked !== 'true' ) {
				return this.clickWhenClickable( driver, selector );
			}
		} );
	} );
}

export function unsetCheckbox( driver, selector ) {
	return driver.findElement( selector ).then( checkbox => {
		checkbox.getAttribute( 'checked' ).then( checked => {
			if ( checked === 'true' ) {
				return this.clickWhenClickable( driver, selector );
			}
		} );
	} );
}

export function waitTillNotPresent( driver, selector, waitOverride ) {
	const timeoutWait = waitOverride ? waitOverride : explicitWaitMS;
	let self = this;

	return driver.wait(
		function() {
			return self.isElementPresent( driver, selector ).then( function( isPresent ) {
				return ! isPresent;
			} );
		},
		timeoutWait,
		`Timed out waiting for element with ${ selector.using } of '${
			selector.value
		}' to NOT be present`
	);
}

/**
 * Check whether an image is actually visible - that is rendered to the screen - not just having a reference in the DOM
 * @param {webdriver} driver - Browser context in which to search
 * @param {WebElement} webElement - Element to search for
 * @returns {Promise} - Resolved when the script is done executing
 */
export function imageVisible( driver, webElement ) {
	return driver.executeScript(
		'return (typeof arguments[0].naturalWidth!="undefined" && arguments[0].naturalWidth>0)',
		webElement
	);
}

export function checkForConsoleErrors( driver ) {
	if ( config.get( 'checkForConsoleErrors' ) === true ) {
		driver
			.manage()
			.logs()
			.get( 'browser' )
			.then( function( logs ) {
				if ( logs.length > 0 ) {
					forEach( logs, log => {
						// Ignore chrome cast errors in Chrome - http://stackoverflow.com/questions/24490323/google-chrome-cast-sender-error-if-chrome-cast-extension-is-not-installed-or-usi/26095117#26095117
						// Also ignore post message errors - this is a known limitation at present
						// Also ignore 404 errors for viewing sites or posts/pages that are private
						if (
							log.message.indexOf( 'cast_sender.js' ) === -1 &&
							log.message.indexOf( '404' ) === -1 &&
							log.message.indexOf( "Failed to execute 'postMessage' on 'DOMWindow'" ) === -1
						) {
							driver.getCurrentUrl().then( url => {
								SlackNotifier.warn( `Found console error: "${ log.message }" on url '${ url }'`, {
									suppressDuplicateMessages: true,
								} );
							} );
						}
					} );
				}
			} );
	}
}

export function ensureMobileMenuOpen( driver ) {
	const self = this;
	const mobileHeaderSelector = by.css( '.section-nav__mobile-header' );
	return driver
		.findElement( mobileHeaderSelector )
		.isDisplayed()
		.then( mobileDisplayed => {
			if ( mobileDisplayed ) {
				driver
					.findElement( by.css( '.section-nav' ) )
					.getAttribute( 'class' )
					.then( classNames => {
						if ( classNames.includes( 'is-open' ) === false ) {
							self.clickWhenClickable( driver, mobileHeaderSelector );
						}
					} );
			}
		} );
}

export function waitForInfiniteListLoad( driver, elementSelector, { numElements = 10 } = {} ) {
	return driver.wait( function() {
		return driver.findElements( elementSelector ).then( elements => {
			return elements.length >= numElements;
		} );
	} );
}

export function switchToWindowByIndex( driver, index ) {
	return driver.getAllWindowHandles().then( handles => {
		return driver.switchTo().window( handles[ index ] );
	} );
}
export function numberOfOpenWindows( driver ) {
	return driver.getAllWindowHandles().then( handles => {
		return handles.length;
	} );
}

export function waitForNumberOfWindows( driver, numberWindows, waitOverride ) {
	const timeoutWait = waitOverride ? waitOverride : explicitWaitMS;

	return driver.wait(
		function() {
			return driver.getAllWindowHandles().then( handles => {
				return handles.length === numberWindows;
			} );
		},
		timeoutWait,
		`Timed out waiting for ${ numberWindows } browser windows`
	);
}

export function closeCurrentWindow( driver ) {
	return driver.close();
}

export function ensurePopupsClosed( driver ) {
	numberOfOpenWindows( driver ).then( numWindows => {
		let windowIndex;
		for ( windowIndex = 1; windowIndex < numWindows; windowIndex++ ) {
			switchToWindowByIndex( driver, windowIndex ).then( () => {
				closeCurrentWindow( driver );
			} );
		}
	} );
	return switchToWindowByIndex( driver, 0 );
}

export async function refreshIfJNError( driver, timeout = 2000 ) {
	if ( dataHelper.getTargetType() !== 'JETPACK' ) {
		return false;
	}

	// Match only 503 Error codes
	const JNSiteError = by.xpath(
		"//pre[@class='error' and .='/srv/users/SYSUSER/log/APPNAME/APPNAME_apache.error.log' and //title[.='503 Service Unavailable']]"
	);

	const refreshIfNeeded = async () => {
		const jnErrorDisplayed = await isEventuallyPresentAndDisplayed( driver, JNSiteError, timeout );
		if ( jnErrorDisplayed ) {
			await driver.navigate().refresh();
			return refreshIfNeeded();
		}
		return true;
	};

	return await refreshIfNeeded();
}

export async function scrollIntoView( driver, selector ) {
	let selectorElement = await driver.findElement( selector );

	return await driver.executeScript(
		'arguments[0].scrollIntoView( { block: "center", inline: "center" } )',
		selectorElement
	);
}
