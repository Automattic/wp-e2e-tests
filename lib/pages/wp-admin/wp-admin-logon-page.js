import { By as by } from 'selenium-webdriver';
import config from 'config';
import BaseContainer from '../../base-container';
import * as driverHelper from '../../driver-helper';

export default class WPAdminLogonPage extends BaseContainer {
	constructor( driver, wpAdminUrl, { visit = false, forceStandardLogon = true } = {} ) {
		super( driver, by.css( '#loginform' ), visit, wpAdminUrl );
		if ( forceStandardLogon === true ) {
			this.ensureWPAdminStandardLogonShown();
		}
	}

	ensureWPAdminStandardLogonShown() {
		const self = this;
		self.driver.findElement( by.tagName( 'body' ) ).getAttribute( 'class' ).then( ( bodyClasses ) => {
			if ( bodyClasses.indexOf( 'jetpack-sso-form-display' ) > -1 ) {
				return driverHelper.clickWhenClickable( self.driver, by.css( '.jetpack-sso-toggle.wpcom' ) );
			}
		} );
		return self.waitForPage();
	}

	logonUsingSSO() {
		const selector = by.css( '#jetpack-sso-wrap__action a' );
		return driverHelper.clickWhenClickable( this.driver, selector );
	}
}
