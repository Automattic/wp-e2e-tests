import { By as by } from 'selenium-webdriver';
import config from 'config';
import BaseContainer from '../../base-container';

import * as driverHelper from '../../driver-helper';

export default class WPAdminPluginsPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.plugins' ) );
	}

	JetpackVersionInstalled() {
		return this.driver.findElement( by.css( 'tr[data-slug="jetpack-by-wordpress-com"] .plugin-version-author-uri,tr[data-slug="jetpack"] .plugin-version-author-uri' ) ).getText().then( ( txt ) => {
			return txt.split( '|' )[0].trim();
		} );
	}

	deactivateJetpack() {
		const self = this;
		const deactivateSelector = by.css( 'tr[data-slug="jetpack-by-wordpress-com"] .deactivate,tr[data-slug="jetpack"] .deactivate' );
		return this.driver.isElementPresent( deactivateSelector ).then( ( located ) => {
			if ( located === true ) {
				return driverHelper.clickWhenClickable( self.driver, deactivateSelector );
			}
		} );
	}

	activateJetpack() {
		const self = this;
		const activateSelector = by.css( 'tr[data-slug="jetpack-by-wordpress-com"] .activate,tr[data-slug="jetpack"] .activate' );
		return this.driver.isElementPresent( activateSelector ).then( ( located ) => {
			if ( located === true ) {
				return driverHelper.clickWhenClickable( self.driver, activateSelector );
			}
		} );
	}

	updateJetpack() {
		const self = this;
		const longWait = config.get( 'explicitWaitMS' ) * 3;
		const updateSelector = by.css( 'tr[data-slug="jetpack-by-wordpress-com"] .activate,tr[data-slug="jetpack"] a.update-link' );
		const updatedSelector = by.css( '.update-message.notice-success' );
		return this.driver.isElementPresent( updateSelector ).then( ( located ) => {
			if ( located === true ) {
				driverHelper.clickWhenClickable( self.driver, updateSelector );
				return driverHelper.waitTillPresentAndDisplayed( self.driver, updatedSelector, longWait );
			}
		} );
	}
}
