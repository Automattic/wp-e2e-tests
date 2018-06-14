/** @format */

import { By as by } from 'selenium-webdriver';

import * as driverManager from '../../driver-manager';
import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class WPAdminSidebar extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, by.css( '#adminmenumain' ) );
	}

	async _postInit() {
		if ( driverManager.currentScreenSize() === 'mobile' ) {
			this.driver
				.findElement( by.css( '#wpwrap' ) )
				.getAttribute( 'class' )
				.then( classValue => {
					if ( classValue !== 'wp-responsive-open' ) {
						driverHelper.clickWhenClickable( this.driver, by.css( '#wp-admin-bar-menu-toggle' ) );
					}
				} );
		}
	}

	async selectPlugins() {
		const plugInMenuSelector = by.css( '#menu-plugins' );
		const plugInMenuItemSelector = by.css( '#menu-plugins li a[href="plugins.php"]' );

		return this._selectMenuItem( plugInMenuSelector, plugInMenuItemSelector );
	}

	async selectJetpack() {
		const jetpackMenuSelector = by.css( '#toplevel_page_jetpack' );
		const menuItemSelector = by.css(
			'#toplevel_page_jetpack a[href$="jetpack#/dashboard"], #toplevel_page_jetpack a[href$="jetpack"]'
		);

		return this._selectMenuItem( jetpackMenuSelector, menuItemSelector );
	}

	async selectJetpackSettings() {
		const jetpackMenuSelector = by.css( '#toplevel_page_jetpack' );
		const menuItemSelector = by.css( '#toplevel_page_jetpack li a[href$="jetpack#/settings"]' );

		return this._selectMenuItem( jetpackMenuSelector, menuItemSelector );
	}

	async selectSettingsSharing() {
		const settingsSelector = by.css( '#menu-settings' );
		const itemSelector = by.css( '#menu-settings a[href$="sharing"]' );

		return this._selectMenuItem( settingsSelector, itemSelector );
	}

	async selectSnippets() {
		const settingsSelector = by.css( '#toplevel_page_snippets' );
		const itemSelector = by.css( '#toplevel_page_snippets a.wp-first-item[href$="snippets"]' );

		return this._selectMenuItem( settingsSelector, itemSelector );
	}

	async selectAppearanceEditCSS() {
		const settingsSelector = by.css( '#menu-appearance' );
		const itemSelector = by.css( '#menu-appearance a[href$="editcss"]' );

		return this._selectMenuItem( settingsSelector, itemSelector );
	}

	async selectAddNewUser() {
		const usersSelector = by.css( '#menu-users' );
		const itemSelector = by.css( '#menu-users a[href*="user-new"]' );

		return this._selectMenuItem( usersSelector, itemSelector );
	}

	async _selectMenuItem( menuSelector, menuItemSelector ) {
		this.driver
			.findElement( menuSelector )
			.getAttribute( 'class' )
			.then( classes => {
				if (
					classes.indexOf( 'wp-menu-open' ) === -1 &&
					classes.indexOf( 'wp-has-current-submenu' ) === -1
				) {
					driverHelper.clickWhenClickable( this.driver, menuSelector );
				}
			} );
		if ( driverManager.currentScreenSize() === 'mobile' ) {
			return driverHelper.followLinkWhenFollowable( this.driver, menuItemSelector );
		}
		return driverHelper.clickWhenClickable( this.driver, menuItemSelector );
	}

	static async refreshIfJNError( driver ) {
		return await driverHelper.refreshIfJNError( driver );
	}
}
