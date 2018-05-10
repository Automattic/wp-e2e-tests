/** @format */

import webdriver from 'selenium-webdriver';
// import { eyesScreenshot } from '../eyes-helper.js';
import { warn as slackWarn } from '../slack-notifier';
import { currentScreenSize } from '../driver-manager';
import BaseContainer from '../base-container.js';

import * as driverHelper from '../driver-helper';

const by = webdriver.By;

export default class DevdocsPage extends BaseContainer {
	constructor( driver, visit ) {
		const baseURL = 'https://wpcalypso.wordpress.com/devdocs';
		//const baseURL = 'http://calypso.localhost:3000/devdocs';

		super( driver, by.css( '.devdocs.main' ), visit, baseURL );

		this.baseURL = baseURL;
		this.designElementLinkSelector = by.css( '.docs-example__wrapper-header-title:not(.button)' );
		this.elementTitleSelector = by.css( '.header-cake__title' );
		this.elementButtonSelector = by.css( '.docs__design-toggle.button' );
		this.allComponentsSelector = by.css( 'button.header-cake__back' );
	}

	openUIComponents() {
		var url = this.baseURL + '/design?debug=true';

		return this.driver.get( url );
	}

	openTypography() {
		var url = this.baseURL + '/typography?debug=true';

		return this.driver.get( url );
	}

	openAppComponents() {
		var url = this.baseURL + '/blocks?debug=true';

		return this.driver.get( url ).then(
			function() {},
			function() {
				slackWarn(
					`[${
						global.browserName
					}][${ currentScreenSize() }] - Driver claims to have failed to get /devdocs/blocks.  Moving on anyway.`
				);
			}
		);
	}

	getCurrentElementTitle() {
		return this.driver.findElement( this.elementTitleSelector ).then( function( el ) {
			return el.getInnerHtml();
		} );
	}

	isCurrentElementCompactable() {
		return driverHelper.isElementPresent( this.driver, this.elementButtonSelector );
	}

	getCurrentElementCompactButton() {
		return this.driver.findElement( this.elementButtonSelector );
	}

	returnToAllComponents() {
		return this.driver.findElement( this.allComponentsSelector ).click();
	}

	hideMasterbar() {
		const driver = this.driver;
		return driverHelper
			.isElementPresent( driver, by.className( 'masterbar' ) )
			.then( function( present ) {
				if ( present ) {
					return driver.executeScript(
						'document.querySelector( ".masterbar" ).style.visibility = "hidden";'
					);
				}
			} );
	}

	hideEnvironmentBadge() {
		return this.driver.executeScript(
			'document.querySelector( ".environment-badge" ).style.visibility = "hidden";'
		);
	}

	// screenshotAllElements( eyes ) {
	// 	const self = this;
	// 	const driver = this.driver;
	//
	// 	return this.getAllDesignElementLinks().then( function( hrefs ) {
	// 		let flow = driver.controlFlow();
	//
	// 		for ( const href of hrefs ) {
	// 			let title;
	//
	// 			// Open the design element
	// 			flow
	// 				.execute( function() {
	// 					let titleSplit = href.split( '/' );
	// 					title = titleSplit[ titleSplit.length - 1 ];
	// 					return driver.get( href );
	// 				} )
	// 				.then(
	// 					function() {},
	// 					function() {
	// 						slackWarn(
	// 							`[${
	// 								global.browserName
	// 							}][${ currentScreenSize() }] - Driver claims to have failed to get ${ title }.  Moving on anyway.`
	// 						);
	// 					}
	// 				);
	// 			// Hide the masterbar for clean CSS stitching
	// 			flow.execute( function() {
	// 				return self.hideMasterbar();
	// 			} );
	// 			// Hide the environment badge for simplicity
	// 			flow.execute( function() {
	// 				return self.hideEnvironmentBadge();
	// 			} );
	// 			// Take the screenshot
	// 			flow.execute( function() {
	// 				return eyesScreenshot( driver, eyes, title, by.id( 'primary' ) );
	// 			} );
	// 			// Check for Compact button
	// 			flow.execute( function() {
	// 				return self.isCurrentElementCompactable().then( function( compactable ) {
	// 					if ( compactable ) {
	// 						return self.getCurrentElementCompactButton().then( function( button ) {
	// 							// Some browsers need a more precise click on the mobile width to avoid overlapping elements
	// 							if (
	// 								global.browserName.toLowerCase() === 'chrome' ||
	// 								global.browserName.toLowerCase() === 'firefox'
	// 							) {
	// 								return driver
	// 									.actions()
	// 									.mouseMove( button, { x: 3, y: 3 } )
	// 									.click()
	// 									.perform()
	// 									.then( function() {
	// 										return eyesScreenshot(
	// 											driver,
	// 											eyes,
	// 											title + ' (Compact)',
	// 											by.id( 'primary' )
	// 										);
	// 									} );
	// 							}
	//
	// 							return button.click().then( function() {
	// 								return eyesScreenshot( driver, eyes, title + ' (Compact)', by.id( 'primary' ) );
	// 							} );
	// 						} );
	// 					}
	// 				} );
	// 			} );
	// 		}
	// 	} );
	// }
}
