import BaseContainerMobile from '../../base-container-mobile.js';
import { By } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper.js';
console.flog = function() {};

export default class LoginPage extends BaseContainerMobile {
	constructor( driver ) {
		super( driver, By.xpath( '//XCUIElementTypeImage[@name="icon-wp"]' ) );

		this.userNameSelector = By.xpath( '//XCUIElementTypeTextField[@name="usernameField"]' );
		this.passwordSelector = By.xpath( '//XCUIElementTypeSecureTextField[@name="passwordField"]' );
		this.nextSelector = By.xpath( '//XCUIElementTypeButton[@name="nextButton"]' );
		this.submitSelector = By.xpath( '//XCUIElementTypeButton[@name="submitButton"]' );
	}

	login( username, password ) {
		const driver = this.driver;
		const self = this;

		console.flog( 'before setting username' );
		return driverHelper.setWhenSettableMobile( driver, self.userNameSelector, username ).then( function() {
			console.flog( 'before clicking next' );
			return driverHelper.clickIfPresentMobile( driver, self.nextSelector ).then( function() {
				console.flog( 'before setting password' );
				return driverHelper.setWhenSettableMobile( driver, self.passwordSelector, password ).then( function() {
					console.flog( 'before clicking submit' );
					return driverHelper.clickWhenClickableMobile( driver, self.submitSelector );
				} );
			} );
		} );
	}

	addSelfHostedURL( url ) {
		var driver = this.driver;
		const selfHostedButtonSelector = By.xpath( '//XCUIElementTypeButton[@label="Add a self-hosted WordPress site"]' );
		const selfHostedURLSelector = By.xpath( '//XCUIElementTypeTextField[@value="Site Address (URL)"]' );
		this.submitSelector = By.xpath( '//XCUIElementTypeButton[@name="ADD SITE"]' );

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
