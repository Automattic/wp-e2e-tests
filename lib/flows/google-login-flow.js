import LoginFlow from './login-flow';
import LoginPage from '../pages/login-page.js';

import ReaderPage from '../pages/reader-page.js';
import GoogleEmailPage from '../pages/external/google-email-page';
import GooglePasswordPage from '../pages/external/google-password-page';

import * as dataHelper from '../data-helper';
import * as driverHelper from '../driver-helper';

export default class GoogleLoginFlow extends LoginFlow {

	login() {
		let testUserName, testPassword, loginPage, emailPage, passwordPage;
		const accountInfo = dataHelper.getAccountConfig( this.account );

		// Make sure account is suitable for GMail authentication
		if ( accountInfo !== undefined && accountInfo[0].indexOf( '@gmail.com' ) >= 0 ) {
			testUserName = accountInfo[0];
			testPassword = accountInfo[1];
		} else {
			throw new Error( `Issue with account key '${this.account}'. Its not found, or not a GMail credential` );
		}

		loginPage = new LoginPage( this.driver, true );
		loginPage.googleLogin()

		driverHelper.eventuallySwitchToNewWindow( this.driver );

		emailPage = new GoogleEmailPage( this.driver )
		emailPage.processEmail( testUserName );

		passwordPage = new GooglePasswordPage( this.driver )
		passwordPage.processPassword( testPassword );

		// Switching back to main window
		this.driver.getAllWindowHandles().then( ( allHandles ) => {
			return this.driver.switchTo().window( allHandles[0] )
		} ).then( () => {
			console.log( 'Opening ReaderPage' )
			let readerPage = new ReaderPage( this.driver );
			return readerPage.waitForPage();
		} )
	}
}
