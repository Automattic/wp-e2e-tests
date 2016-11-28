import BaseContainerMobile from '../../base-container-mobile.js';
import { By } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper.js';

export default class LoginPage extends BaseContainerMobile {
	constructor( driver ) {
		super( driver, By.xpath( '//UIAImage[@name="icon-wp"]' ) );

		this.userNameSelector = By.xpath( '//XCUIElementTypeTextField[1]' );
		this.passwordSelector = By.xpath( '//XCUIElementTypeSecureTextField[1]' );
		this.nextSelector = By.xpath( '//XCUIElementTypeButton[@name="NEXT"]' );
		this.submitSelector = By.xpath( '//XCUIElementTypeButton[@name="LOG IN"]' );
	}

	login( username, password ) {
		var driver = this.driver;
		const userNameSelector = this.userNameSelector;
		const self = this;

		driverHelper.setWhenSettableMobile( driver, self.userNameSelector, username ).then( function() {
			return driverHelper.clickIfPresentMobile( driver, self.nextSelector ).then( function() {
				return driverHelper.setWhenSettableMobile( driver, self.passwordSelector, password ).then( function() {
					return driverHelper.clickWhenClickableMobile( driver, self.submitSelector );
				} );
			} );
		} );

		return driver.wait( function() {
			return driver.isElementPresent( userNameSelector ).then( function( present ) {
				return !present;
			} );
		}, this.explicitWaitMS, 'The login form is still displayed after submitting the logon form' );
	}

	addSelfHostedURL( url ) {
		var driver = this.driver;
		const selfHostedButtonSelector = By.xpath( '//UIAButton[@name="Add Self-Hosted Site"]' );
		const selfHostedURLSelector = By.xpath( '//UIAApplication[1]/UIAWindow[1]/UIATextField[2]' );
		this.submitSelector = By.xpath( '//UIAButton[@name="Add Site"]' );

		return driverHelper.clickWhenClickableMobile( driver, selfHostedButtonSelector ).then( function() {
			driverHelper.setWhenSettableMobile( driver, selfHostedURLSelector, url );
		} );
	}

	clickCreateASite() {
		var driver = this.driver;
		const createASiteSelector = By.xpath( '//UIAButton[@name="Create Account"]' );
		return driverHelper.clickWhenClickableMobile( driver, createASiteSelector );
	}
}
