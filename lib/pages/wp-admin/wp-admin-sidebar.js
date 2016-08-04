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
		this.driver.findElement( plugInMenuSelector ).getAttribute( 'class' ).then( ( classes ) => {
			if ( classes.indexOf( 'wp-menu-open' ) === -1 ) {
				driverHelper.clickWhenClickable( this.driver, plugInMenuSelector );
			}
		} );
		return driverHelper.clickWhenClickable( this.driver, by.css( '#menu-plugins li a[href="plugins.php"]' ) );
	}
}
