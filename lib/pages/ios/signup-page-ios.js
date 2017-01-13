import BaseContainerMobile from '../../base-container-mobile.js';
import { By } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper.js';

export default class SignupPage extends BaseContainerMobile {
	constructor( driver ) {
		super( driver, By.xpath( '//XCUIElementTypeStaticText[@name="nuxHeaderMessage"]' ) );

		this.emailSelector = By.xpath( '//XCUIElementTypeTextField[@name="emailAddress"]' );
		this.userNameSelector = By.xpath( '//XCUIElementTypeTextField[@name="username"]' );
		this.passwordSelector = By.xpath( '//XCUIElementTypeSecureTextField[@name="password"]' );
		this.siteNameSelector = By.xpath( '//XCUIElementTypeTextField[@name="siteAddress"]' );
		this.createAccountButtonSelector = By.xpath( '//XCUIElementTypeButton[@name="submitButton"]' );
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

	getErrorMessage() {
		const driver = this.driver;
		const errorSelector = By.xpath( '//XCUIElementTypeStaticText[@name="errorDescription"]' );

		return driver.wait( () => {
			return driver.findElement( errorSelector ).then( ( errorElement ) => {
				return errorElement.getText();
			}, () => {
				return false;
			} );
		}, this.explicitWaitMS, 'Timed out looking for the error message dialog' );
	}

	acknowledgeError() {
		const errorOKButtonSelector = By.xpath( '//XCUIElementTypeButton[@name="okButton"]' );

		return driverHelper.clickWhenClickableMobile( this.driver, errorOKButtonSelector );
	}
}
