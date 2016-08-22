import { By as by } from 'selenium-webdriver';
import BaseContainer from '../../base-container';
import * as driverManager from '../../driver-manager';
import * as driverHelper from '../../driver-helper';

export default class WPAdminSidebar extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '#adminmenumain' ) );
		if ( driverManager.currentScreenSize() === 'mobile' ) {
			this.driver.findElement( by.css( '#wpwrap' ) ).getAttribute( 'class' ).then( ( classValue ) => {
				if ( classValue !== 'wp-responsive-open' ) {
					driverHelper.clickWhenClickable( this.driver, by.css( '#wp-admin-bar-menu-toggle' ) );
				}
			} );
		}
	}

	selectPlugins() {
		const plugInMenuSelector = by.css( '#menu-plugins' );
		const plugInMenuItemSelector = by.css( '#menu-plugins li a[href="plugins.php"]' );

		return this._selectMenuItem( plugInMenuSelector, plugInMenuItemSelector );
	}

	selectJetpack() {
		const jetpackMenuSelector = by.css( '#toplevel_page_jetpack' );
		const menuItemSelector = by.css( '#toplevel_page_jetpack li a[href$="jetpack"]' );

		return this._selectMenuItem( jetpackMenuSelector, menuItemSelector );
	}

	selectJetpackSettings() {
		const jetpackMenuSelector = by.css( '#toplevel_page_jetpack' );
		const menuItemSelector = by.css( '#toplevel_page_jetpack li a[href*="jetpack#/settings"]' );

		return this._selectMenuItem( jetpackMenuSelector, menuItemSelector );
	}

	selectSettingsSharing() {
		const settingsSelector = by.css( '#menu-settings' );
		const itemSelector = by.css( '#menu-settings a[href$="sharing"]' );

		return this._selectMenuItem( settingsSelector, itemSelector );
	}

	_selectMenuItem( menuSelector, menuItemSelector ) {
		this.driver.findElement( menuSelector ).getAttribute( 'class' ).then( ( classes ) => {
			if ( classes.indexOf( 'wp-menu-open' ) === -1 ) {
				driverHelper.clickWhenClickable( this.driver, menuSelector );
			}
		} );
		return driverHelper.clickWhenClickable( this.driver, menuItemSelector );
	}
}
