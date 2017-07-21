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
import BluehostJPOIsBlogStepPage from '../lib/pages/bluehost/bluehost-jpo-is-blog-step-page';
import BluehostJPOHomepageStepPage from '../lib/pages/bluehost/bluehost-jpo-homepage-step-page';
import BluehostJPOContactStepPage from '../lib/pages/bluehost/bluehost-jpo-contact-step-page';
import BluehostJPOJetpackStepPage from '../lib/pages/bluehost/bluehost-jpo-jetpack-step-page';
import BluehostJPOReviewStepPage from '../lib/pages/bluehost/bluehost-jpo-review-step-page';

import WpcomLoginPage from '../lib/pages/login-page';
import WPAdminLogonPage from '../lib/pages/wp-admin/wp-admin-logon-page';
import WPAdminHomePage from '../lib/pages/wp-admin/wp-admin-home-page';

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

		test.describe( 'can interact with blog step page', () => {
			test.it( 'can select site will not have blog posts', () => {
				this.bluehostJPOIsBlogStepPage = new BluehostJPOIsBlogStepPage( driver );
				this.bluehostJPOIsBlogStepPage.clickNopeButton();
				return this.bluehostJPOIsBlogStepPage.revisitIsBlogStep();
			} );

			test.it( 'can select site will have blog posts', () => {
				return this.bluehostJPOIsBlogStepPage.clickYesButton();
			} );
		} );

		test.describe( 'can interact with homepage step page', () => {
			test.it( 'can select front page will contain posts', () => {
				this.bluehostJPOIsHomepageStep = new BluehostJPOHomepageStepPage( driver );
				this.bluehostJPOIsHomepageStep.clickBlogRadio();
				return this.bluehostJPOIsHomepageStep.revisitHomepageStep();
			} );

			test.it( 'can select static home page', () => {
				this.bluehostJPOIsHomepageStep.clickStaticRadio();
				return this.bluehostJPOIsHomepageStep.revisitHomepageStep();
			} );

			test.it( 'can skip homepage step', () => {
				return this.bluehostJPOIsHomepageStep.clickSkipThisStep();
			} );
		} );

		test.describe( 'can interact with contact page step', () => {
			test.it( 'can select no thanks', () => {
				this.bluehostJPOContactStepPage = new BluehostJPOContactStepPage( driver );
				this.bluehostJPOContactStepPage.clickNoButton();
				return this.bluehostJPOContactStepPage.revisitContactPageStep();
			} );

			test.it( 'can select yes button', () => {
				return this.bluehostJPOContactStepPage.clickYesButton();
			} );
		} );

		test.describe( 'can interact with Jetpack step', () => {
			// test.it( 'can click connect button', () => {
			// 	this.bluehostJPOJetpackStepPage = new BluehostJPOJetpackStepPage( driver );
			// 	return this.bluehostJPOJetpackStepPage.clickConnectButton();
			// } )

			// test.it( 'clicking connect sends user to WordPress.com', () => {
			// 	this.wpcomLoginPage = new WpcomLoginPage( driver );
			// 	return this.wpcomLoginPage.isLegacyLoginShowing();
			// } );

			test.it( 'can click not now button', () => {
				this.bluehostJPOJetpackStepPage = new BluehostJPOJetpackStepPage( driver );
				return this.bluehostJPOJetpackStepPage.clickNotNowButton();
			} );
		} );

		test.describe( 'can interact with dismiss step', () => {
			test.it( 'can click dismiss button', () => {
				this.bluehostJPOReviewStepPage = new BluehostJPOReviewStepPage( driver );
				return this.bluehostJPOReviewStepPage.clickDismissButton();
			} );
		} );

		test.describe( 'JPO dismissal', () => {
			test.it( 'user lands on dashboard when JPO dismissed', () => {
				const urlBase = config.get( 'bluehostTestDomain' );
				this.wpAdminHomePage = new WPAdminHomePage( driver, false, `${urlBase}/wp-admin` );
				return this.wpAdminHomePage.isJetpackDashboardConnectWidgetShowing();
			} );
		} );
	} );
} );
