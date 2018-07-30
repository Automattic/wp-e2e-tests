/** @format */

import { By } from 'selenium-webdriver';

import AsyncBaseContainer from '../async-base-container';

import * as driverHelper from '../driver-helper.js';

export default class PurchaseDomainOnlyComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.src-components-domain-search-content' ) );
	}

	async waitForResults() {
		const driver = this.driver;
		const resultsLoadingSelector = By.css( '.domain-suggestion.is-placeholder' );
		await driver.wait(
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
		return await this.checkForUnknownABTestKeys();
	}

	async searchForDomainNameAndSelectRecommended( domainName ) {
		const searchInputSelector = By.css( '.src-components-domain-search-input' );
		await driverHelper.setWhenSettable( this.driver, searchInputSelector, domainName );
		await this.waitForResults();
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.src-components-domain-recommended-label' )
		);
	}
}
