import webdriver from 'selenium-webdriver';

import * as driverHelper from '../../driver-helper.js';

import BaseContainer from '../../base-container.js';

const by = webdriver.By;
//const screenSize = driverManager.currentScreenSize();

export default class TumblrAuthorizePage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '#signup_forms' ) );
	}

	signInAndAllow( email, password ) {
		driverHelper.setWhenSettable( this.driver, by.css( 'input#signup_determine_email' ), email );
		driverHelper.clickWhenClickable( this.driver, by.css( '.signup_determine_btn.active' ) );
		driverHelper.setWhenSettable( this.driver, by.css( 'input#signup_password' ), password, { secureValue: true } );
		driverHelper.clickWhenClickable( this.driver, by.css( '.signup_login_btn.active' ) );
		return driverHelper.clickWhenClickable( this.driver, by.css( 'button[name="allow"]' ) );
	}
};
