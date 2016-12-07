import BaseContainerMobile from '../../base-container-mobile.js';
import { By } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper.js';
import assert from 'assert';

export default class SignupPage extends BaseContainerMobile {
	constructor( driver ) {
		super( driver, By.xpath( '//XCUIElementTypeStaticText[@name="Create an account on WordPress.com"]' ) );

		this.emailSelector = By.xpath( '//XCUIElementTypeTextField[1]' );
		this.userNameSelector = By.xpath( '//XCUIElementTypeTextField[2]' );
		this.passwordSelector = By.xpath( '//XCUIElementTypeSecureTextField[1]' );
		this.siteNameSelector = By.xpath( '//XCUIElementTypeTextField[3]' );
		this.createAccountButtonSelector = By.xpath( '//XCUIElementTypeButton[@name="CREATE ACCOUNT"]' );
	}

	enterAccountDetailsAndSubmit( email, username, password, siteName ) {
		var driver = this.driver;

		driverHelper.setWhenSettableMobile( driver, this.emailSelector, email );
		driverHelper.setWhenSettableMobile( driver, this.userNameSelector, username );
		driverHelper.setWhenSettableMobile( driver, this.passwordSelector, password );

		if ( siteName !== undefined ) {
			driverHelper.setWhenSettableMobile( driver, this.siteNameSelector, siteName );
		}

		return driverHelper.clickWhenClickableMobile( driver, this.createAccountButtonSelector );
	}

	verifyErrorPresent( errorText ) {
		const driver = this.driver;
		const errorSelector = By.xpath( `//XCUIElementTypeStaticText[@name="${errorText}"]` );
		const errorOKButtonSelector = By.xpath( '//XCUIElementTypeButton[@name="OK"]' );

		return driver.wait( driver.isElementPresent( errorSelector ).then( function( present ) {
			if ( present ) {
				return driverHelper.clickWhenClickableMobile( driver, errorOKButtonSelector );
			} else {
				assert( false, `Error message '${errorText}' is not displayed` );
			}
		} ), this.explicitWaitMS, `Error message '${errorText}' is not displayed` );
	}
}
