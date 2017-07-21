import test from 'selenium-webdriver/testing';
import config from 'config';
// import assert from 'assert';

import * as driverManager from '../lib/driver-manager';
import { allowRetries } from '../lib/driver-helper';

import BluehostLoginPage from '../lib/pages/bluehost/bluehost-login-page';
import BluehostInstallWordPressPage from '../lib/pages/bluehost/bluehost-install-wordpress-page';
import BluehostInstallWordPressDetailsPage from '../lib/pages/bluehost/bluehost-install-wordpress-details-page';
import BluehostInstallingwordPressPage from '../lib/pages/bluehost/bluehost-installing-wordpress-page';

import BluehostJPOFirstStepPage from '../lib/pages/bluehost/bluehost-jpo-first-step-page';

import WPAdminLogonPage from '../lib/pages/wp-admin/wp-admin-logon-page';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );

// When setting this in test.before below, it resulted in undefined? Perhaps the before never fired?
var driver;
test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( 'Can step through JPO flow on Bluehost', function() {
	this.bailSuite( true );
	this.timeout( mochaTimeOut );

	test.before( function() {
		this.timeout( startBrowserTimeoutMS );
		driver = driverManager.startBrowser();
		return driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	test.describe( 'Can provision Bluehost site', function() {
		test.it( 'can login to Bluehost.com', () => {
			this.bluehostLogin = new BluehostLoginPage( driver );
			return this.bluehostLogin.logon();
		} );

		test.it( 'can select a domain to install WordPress on', () => {
			this.bluehostInstallWordPressPage = new BluehostInstallWordPressPage( driver );
			return this.bluehostInstallWordPressPage.installWordPress();
		} );

		test.it( 'can enter WordPress installation details', () => {
			this.bluehostInstallWordPressDetailsPage = new BluehostInstallWordPressDetailsPage( driver );
			return this.bluehostInstallWordPressDetailsPage.submitAdminDetails();
		} );

		test.it( 'can finish WordPress installation', () => {
			this.bluehostInstallingWordPressPage = new BluehostInstallingwordPressPage( driver );
			return this.bluehostInstallingWordPressPage.finishesInstall();
		} );
	} );

	test.describe( 'Can login to newly provisioned site', () => {
		test.it( 'login succeeds', () => {
			const url = `${config.get( 'bluehostTestDomain' )}/wp-login.php`,
				args = { visit: true, forceStandardLogon: true },
				userLogin = config.get( 'bluehostWPInstallUsername' ),
				userPass = config.get( 'bluehostWPInstallPassword' );

			return allowRetries( driver, () => {
				this.loginPage = new WPAdminLogonPage( driver, url, args );
				return this.loginPage.logonStandard( userLogin, userPass )
			}, 3 );
		} );
	} );

	test.describe( 'Can step through JPO flow', () => {
		test.describe( 'can interact with first step page', () => {
			test.it( 'can select business type site', () => {
				this.bluehostJPOFirstStepPage = new BluehostJPOFirstStepPage( driver, true );
				return this.bluehostJPOFirstStepPage.selectBusinessType();
			} );

			test.it( 'can reset JPO', () => {
				return this.bluehostJPOFirstStepPage.resetJPO();
			} );

			test.it( 'can select personal type site', () => {
				return this.bluehostJPOFirstStepPage.selectPersonalType();
			} );

			test.it( 'can submit site title and description form', () => {
				return this.bluehostJPOFirstStepPage.submitSiteTitleAndDescriptionForm();
			} );
		} );
	} );
} );
