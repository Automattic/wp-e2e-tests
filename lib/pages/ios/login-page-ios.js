import BaseContainerMobile from '../../base-container-mobile.js';
import { By } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper.js';

export default class LoginPage extends BaseContainerMobile {
	constructor( driver ) {
		super( driver, By.xpath( '//XCUIElementTypeImage[@name="icon-wp"]' ) );

		this.userNameSelector = By.xpath( '//XCUIElementTypeTextField[@name="Username / Email"]' );
		this.passwordSelector = By.xpath( '//XCUIElementTypeSecureTextField[@name="password"]' );
		this.nextSelector = By.xpath( '//XCUIElementTypeButton[@name="nextButton"]' );
		this.submitSelector = By.xpath( '//XCUIElementTypeButton[@name="submitButton"]' );
	}

	login( username, password ) {
		const driver = this.driver;
		const self = this;

		return driverHelper.setWhenSettableMobile( driver, self.userNameSelector, username ).then( function() {
			return driverHelper.clickIfPresentMobile( driver, self.nextSelector ).then( function() {
				return driverHelper.setWhenSettableMobile( driver, self.passwordSelector, password ).then( function() {
					return driverHelper.clickWhenClickableMobile( driver, self.submitSelector );
				} );
			} );
		} );
	}

	addSelfHostedURL( url ) {
		var driver = this.driver;
		const selfHostedButtonSelector = By.xpath( '//XCUIElementTypeButton[@name="addSelfHostedButton"]' );
		const selfHostedURLSelector = By.xpath( '//XCUIElementTypeTextField[@name="Site Address (URL)"]' );

		return driverHelper.clickWhenClickableMobile( driver, selfHostedButtonSelector ).then( function() {
			return driverHelper.clickWhenClickableMobile( driver, selfHostedURLSelector ).then( function() {
				return driverHelper.setWhenSettableMobile( driver, selfHostedURLSelector, url );
			} );
		} );
	}

	clickCreateASite() {
		var driver = this.driver;
		const createASiteSelector = By.xpath( '//XCUIElementTypeButton[@name="Create a site"]' );
		return driverHelper.clickWhenClickableMobile( driver, createASiteSelector );
	}
}
