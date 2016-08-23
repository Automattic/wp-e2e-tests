import { By as by } from 'selenium-webdriver';
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
		const deactivateSelector = by.css( 'tr[data-slug="jetpack-by-wordpress-com"] .deactivate' );
		this.driver.isElementPresent( deactivateSelector ).then( ( located ) => {
			if ( located === true ) {
				driverHelper.clickWhenClickable( self.driver, deactivateSelector );
			}
		} );
	}

	activateJetpack() {
		const self = this;
		const activateSelector = by.css( 'tr[data-slug="jetpack-by-wordpress-com"] .activate' );
		this.driver.isElementPresent( activateSelector ).then( ( located ) => {
			if ( located === true ) {
				driverHelper.clickWhenClickable( self.driver, activateSelector );
			}
		} );
	}
}
