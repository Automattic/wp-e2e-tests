/** @format */

import { By, until } from 'selenium-webdriver';

import BaseContainer from '../base-container.js';

import * as slackNotifier from '../slack-notifier';
import * as driverHelper from '../driver-helper.js';

export default class FindADomainComponent extends BaseContainer {
	constructor( driver ) {
		if ( global.browserName === 'Internet Explorer' ) {
			driver.navigate().refresh(); // https://github.com/Automattic/wp-e2e-tests/issues/1089
		}
		super( driver, By.css( '.register-domain-step' ) );
		this.declineGoogleAppsLinkSelector = By.className( 'google-apps-dialog__checkout-button' );
	}

	waitForResults() {
		const driver = this.driver;
		const resultsLoadingSelector = By.css( '.domain-suggestion.is-placeholder' );
		driver.wait(
			function() {
				return driverHelper
					.isElementPresent( driver, resultsLoadingSelector )
					.then( function( present ) {
						return ! present;
					} );
			},
			this.explicitWaitMS * 2,
			'The domain results loading element was still present when it should have disappeared by now.'
		);
		return this.checkForUnknownABTestKeys();
	}

	waitForGoogleApps() {
		return this.driver.wait(
			until.elementLocated( this.declineGoogleAppsLinkSelector ),
			this.explicitWaitMS,
			'Could not locate the link to decline google apps.'
		);
	}

	searchForBlogNameAndWaitForResults( blogName ) {
		const searchInputSelector = By.className( 'search__input' );
		driverHelper.setWhenSettable( this.driver, searchInputSelector, blogName );
		return this.waitForResults();
	}

	checkAndRetryForFreeBlogAddresses( expectedBlogAddresses, blogName ) {
		const self = this;
		self.freeBlogAddress().then( actualAddress => {
			if ( expectedBlogAddresses.indexOf( actualAddress ) < 0 ) {
				let message = `The displayed free blog address: '${ actualAddress }' was not in the expected addresses: '${ expectedBlogAddresses }'. Re-searching for '${ blogName }' now.`;
				slackNotifier.warn( message );
				self.searchForBlogNameAndWaitForResults( blogName );
			}
		} );
	}

	freeBlogAddress() {
		const freeBlogAddressSelector = By.css( '.domain-suggestion__content h3' );
		return this.driver
			.findElement( freeBlogAddressSelector )
			.getText()
			.then( function( text ) {
				return text;
			} );
	}

	selectDomainAddress( domainAddress ) {
		const selector = By.css( `[data-e2e-domain="${ domainAddress }"]` );
		this.driver.wait(
			until.elementLocated( selector ),
			this.explicitWaitMS,
			'Could not locate the select button for the paid address: ' + domainAddress
		);
		const element = this.driver.findElement( selector );
		this.driver.wait(
			until.elementIsEnabled( element ),
			this.explicitWaitMS,
			'The paid address button for ' + domainAddress + ' does not appear to be enabled to click'
		);
		return driverHelper.clickWhenClickable( this.driver, selector, this.explicitWaitMS );
	}

	selectFreeAddress() {
		const freeAddressSelector = By.css( '.domain-suggestion.is-clickable' );
		return driverHelper.clickWhenClickable( this.driver, freeAddressSelector, this.explicitWaitMS );
	}

	selectUseOwnDomain() {
		const useOwnDomain = By.css( '.domain-suggestion.card.domain-transfer-suggestion' );
		return driverHelper.clickWhenClickable( this.driver, useOwnDomain, this.explicitWaitMS );
	}

	declineGoogleApps() {
		return driverHelper.clickWhenClickable(
			this.driver,
			this.declineGoogleAppsLinkSelector,
			this.explicitWaitMS
		);
	}

	selectAddEmailForGoogleApps() {
		const googleAppsFieldsSelector = By.css( 'fieldset.google-apps-dialog__user-fields' );
		this.waitForGoogleApps();
		driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.google-apps-dialog__continue-button' ),
			this.explicitWaitMS
		);
		this.driver.wait(
			until.elementLocated( googleAppsFieldsSelector ),
			this.explicitWaitMS,
			'Could not locate the google apps information fieldset'
		);
		const googleAppsFieldsElement = this.driver.findElement( googleAppsFieldsSelector );
		return this.driver.wait(
			until.elementIsVisible( googleAppsFieldsElement ),
			this.explicitWaitMS,
			'Could not see the google apps information fieldset displayed, check it is visible'
		);
	}

	selectPreviousStep() {
		return driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'a.previous-step' ),
			this.explicitWaitMS
		);
	}
}
