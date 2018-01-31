import webdriver from 'selenium-webdriver';
import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

const by = webdriver.By;
const until = webdriver.until;

export default class PluginDetailsPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.plugin__page' ) );
		this.successNoticeSelector = by.css( '.notice.is-success.is-dismissable' );
		this.activatePluginSelector = by.css( '.plugin-activate-toggle .form-toggle__switch' );
	}

	clickActivateToggleForPlugin() {
		return driverHelper.clickWhenClickable( this.driver, this.activatePluginSelector, this.explicitWaitMS );
	}

	waitForPlugin() {
		return this.driver.wait( until.elementLocated( this.activatePluginSelector ), this.explicitWaitMS, 'Could not locate the activate plugin link for the plugin' );
	}

	waitForSuccessNotice() {
		this.driver.wait( until.elementLocated( this.successNoticeSelector ), this.explicitWaitMS, 'Could not locate the success notice. Check that is is displayed.' );
	}

	getSuccessNoticeText() {
		return this.driver.findElement( this.successNoticeSelector ).getText();
	}

	ensureDeactivated() {
		const self = this;
		return self.driver.findElement( self.activatePluginSelector ).getAttribute( 'aria-checked' ).then( ( active ) => {
			if ( active === 'true' ) {
				driverHelper.clickWhenClickable( self.driver, self.activatePluginSelector );
				return this.waitForSuccessNotice();
			}
		} );
	}

	goBack() {
		return driverHelper.clickWhenClickable( this.driver, by.css( '.header-cake__back' ) );
	}
}
