import BaseContainerMobile from '../../base-container-mobile.js';
import { By } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper.js';

export default class LoginPage extends BaseContainerMobile {
	constructor( driver ) {
		super( driver, By.xpath( '//UIAImage[@name="icon-wp"]' ) );

		this.userNameSelector = By.xpath( '//UIAApplication[1]/UIAWindow[1]/UIATextField[1]' );
		this.passwordSelector = By.xpath( '//UIAApplication[1]/UIAWindow[1]/UIASecureTextField[1]' );
		this.submitSelector = By.xpath( '//UIAApplication[1]/UIAWindow[1]/UIAButton[1]' );
	}

	login( username, password ) {
		var driver = this.driver;
		const userNameSelector = this.userNameSelector;

		driverHelper.setWhenSettableMobile( driver, this.userNameSelector, username );
		driverHelper.clickWhenClickableMobile( driver, this.submitSelector );

		driverHelper.setWhenSettableMobile( driver, this.passwordSelector, password );

		driverHelper.clickWhenClickableMobile( driver, this.submitSelector );

		return driver.wait( function() {
			return driver.isElementPresent( userNameSelector ).then( function( present ) {
				return !present;
			} );
		}, this.explicitWaitMS, 'The login form is still displayed after submitting the logon form' );
	}

	addSelfHostedURL( url ) {
		var driver = this.driver;
		const selfHostedButtonSelector = By.xpath( '//UIAButton[@name="Add a self-hosted WordPress site"]' );
		const selfHostedURLSelector = By.xpath( '//UIAApplication[1]/UIAWindow[1]/UIATextField[2]' );

		return driverHelper.clickWhenClickableMobile( driver, selfHostedButtonSelector ).then( function() {
			driverHelper.setWhenSettableMobile( driver, selfHostedURLSelector, url );
		} );
	}
}
