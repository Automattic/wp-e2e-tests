/** @format */

import { By as by } from 'selenium-webdriver';
import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';

export default class WPAdminPluginsPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.plugins' ) );
	}

	jetpackVersionInstalled() {
		const versionSelector = by.css(
			'tr[data-slug="jetpack"] .plugin-version-author-uri,tr[data-slug="jetpack"] .plugin-version-author-uri'
		);
		return this.driver
			.findElement( versionSelector )
			.getText()
			.then( txt => txt.split( '|' )[ 0 ].trim() );
	}

	deactivateJetpack() {
		const deactivateSelector = by.css(
			'tr[data-slug="jetpack"] .deactivate,tr[data-slug="jetpack"] .deactivate'
		);
		return driverHelper.clickIfPresent( this.driver, deactivateSelector );
	}

	activateJetpack() {
		const activateSelector = by.css(
			'tr[data-slug="jetpack"] .activate,tr[data-slug="jetpack"] .activate'
		);
		return driverHelper.clickIfPresent( this.driver, activateSelector );
	}

	connectJetpackAfterActivation() {
		const selector = by.css( '.jp-connect-full__card a.is-primary' );

		return driverHelper.clickWhenClickable( this.driver, selector, 10000 );
	}

	updateJetpack() {
		const updateSelector = by.css(
			'tr[data-slug="jetpack"] .activate,tr[data-slug="jetpack"] a.update-link'
		);
		const updatedSelector = by.css( '.update-message.notice-success' );

		return driverHelper
			.clickIfPresent( this.driver, updateSelector )
			.then( () =>
				driverHelper.waitTillPresentAndDisplayed(
					this.driver,
					updatedSelector,
					this.explicitWaitMS * 3
				)
			);
	}
}
