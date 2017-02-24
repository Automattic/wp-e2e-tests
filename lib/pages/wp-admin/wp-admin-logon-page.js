import { By as by, promise as Promise } from 'selenium-webdriver';
import BaseContainer from '../../base-container';
import * as SlackNotifier from '../../slack-notifier.js';
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
		const driver = this.driver;
		const selector = by.css( '#jetpack-sso-wrap__action a' );

		return driverHelper.clickWhenClickable( driver, selector ).then( () => {
			const errorBackButtonSelector = by.css( '#error-page .button' );
			let d = Promise.defer();

			driver.findElement( errorBackButtonSelector ).then( () => {
				SlackNotifier.warn( 'Error signing onto Jetpack site via SSO' );

				return driverHelper.clickWhenClickable( driver, errorBackButtonSelector ).then( () => {
					// Go back, refresh the page, and try again
					return driver.navigate().refresh().then( () => {
						return driverHelper.clickWhenClickable( driver, selector ).then( () => {
							d.fulfill();
						} );
					} );
				} );
			}, () => {
				d.fulfill();
			} );

			return d.promise;
		} );
	}
}
