/** @format */

import test from 'selenium-webdriver/testing';
import config from 'config';
import assert from 'assert';

import LoginFlow from '../lib/flows/login-flow';
import SignUpFlow from '../lib/flows/sign-up-flow';

import AddNewSitePage from '../lib/pages/add-new-site-page';
import JetpackAuthorizePage from '../lib/pages/jetpack-authorize-page';
import JetpackConnectInstallPage from '../lib/pages/jetpack-connect-install-page';
import PickAPlanPage from '../lib/pages/signup/pick-a-plan-page';
import WPAdminPluginsPage from '../lib/pages/wp-admin/wp-admin-plugins-page.js';
import WPAdminPluginPopup from '../lib/pages/wp-admin/wp-admin-plugin-popup';
import WPAdminUpdatesPage from '../lib/pages/wp-admin/wp-admin-updates-page';
import WPAdminJetpackPage from '../lib/pages/wp-admin/wp-admin-jetpack-page.js';
import WPAdminDashboardPage from '../lib/pages/wp-admin/wp-admin-dashboard-page';
import WPAdminNewUserPage from '../lib/pages/wp-admin/wp-admin-new-user-page';
import WPAdminLogonPage from '../lib/pages/wp-admin/wp-admin-logon-page';
import WPAdminSidebar from '../lib/pages/wp-admin/wp-admin-sidebar.js';
import SidebarComponent from '../lib/components/sidebar-component';
import JetpackConnectFlow from '../lib/flows/jetpack-connect-flow';
import JetpackConnectPage from '../lib/pages/jetpack/jetpack-connect-page';
import JetpackConnectAddCredentialsPage from '../lib/pages/jetpack/jetpack-connect-add-credentials-page';
import PlansPage from '../lib/pages/plans-page';
import LoginPage from '../lib/pages/login-page';
import JetpackComPage from '../lib/pages/external/jetpackcom-page';
import JetpackComFeaturesDesignPage from '../lib/pages/external/jetpackcom-features-design-page';
import WooWizardSetupPage from '../lib/pages/woocommerce/wizard-setup-page';
import WooWizardPaymentsPage from '../lib/pages/woocommerce/wizard-payments-page';
import WooWizardShippingPage from '../lib/pages/woocommerce/wizard-shipping-page';
import WooWizardExtrasPage from '../lib/pages/woocommerce/wizard-extras-page';
import WooWizardJetpackPage from '../lib/pages/woocommerce/wizard-jetpack-page';
import WooWizardReadyPage from '../lib/pages/woocommerce/wizard-ready-page';

import * as driverManager from '../lib/driver-manager';
import * as dataHelper from '../lib/data-helper';
import JetpackComPricingPage from '../lib/pages/external/jetpackcom-pricing-page';
import SecurePaymentComponent from '../lib/components/secure-payment-component';
import WPHomePage from '../lib/pages/wp-home-page';
import CheckOutThankyouPage from '../lib/pages/signup/checkout-thankyou-page';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const signupInboxId = config.get( 'signupInboxId' );
const testCreditCardDetails = dataHelper.getTestCreditCardDetails();
const sandboxCookieValue = config.get( 'storeSandboxCookieValue' );
const locale = driverManager.currentLocale();

let driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `Jetpack Connect: (${ screenSize })`, function() {
	this.timeout( mochaTimeOut );

	test.describe( 'Disconnect expired sites: @parallel @jetpack @canary', function() {
		this.bailSuite( true );

		test.before( function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'Can disconnect any expired sites', function() {
			const jnFlow = new JetpackConnectFlow( driver, 'jetpackConnectUser' );
			return jnFlow.removeSites();
		} );
	} );

	test.describe( 'Connect From Calypso: @parallel @jetpack @canary', function() {
		this.bailSuite( true );

		test.before( function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'Can create wporg site', function() {
			const template = dataHelper.isRunningOnJetpackBranch() ? 'branch' : 'default';
			this.jnFlow = new JetpackConnectFlow( driver, null, template );
			return this.jnFlow.createJNSite();
		} );

		test.it( 'Can log in', function() {
			const loginFlow = new LoginFlow( driver, 'jetpackConnectUser' );
			loginFlow.loginAndSelectMySite();
		} );

		test.it( 'Can add new site', function() {
			const sidebarComponent = new SidebarComponent( driver );
			sidebarComponent.addNewSite( driver );
			const addNewSitePage = new AddNewSitePage( driver );
			return addNewSitePage.addSiteUrl( this.jnFlow.url );
		} );

		test.it( 'Can click the free plan button', function() {
			this.pickAPlanPage = new PickAPlanPage( driver );
			return this.pickAPlanPage.selectFreePlanJetpack();
		} );

		test.it( 'Has site URL in route', function( done ) {
			const siteSlug = this.jnFlow.url.replace( /^https?:\/\//, '' );
			return driver.getCurrentUrl().then( url => {
				if ( url.includes( siteSlug ) ) {
					return done();
				}
				done( `Route ${ url } does not include site slug ${ siteSlug }` );
			} );
		} );
	} );

	test.describe( 'Connect From wp-admin: @parallel @jetpack @canary', function() {
		this.bailSuite( true );

		test.before( function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'Can create wporg site', function() {
			const template = dataHelper.isRunningOnJetpackBranch() ? 'branch' : 'default';
			this.jnFlow = new JetpackConnectFlow( driver, null, template );
			return this.jnFlow.createJNSite();
		} );

		test.it( 'Can navigate to the Jetpack dashboard', function() {
			this.wpAdminSidebar = new WPAdminSidebar( driver );
			return this.wpAdminSidebar.selectJetpack();
		} );

		test.it( 'Can click the Connect Jetpack button', function() {
			this.wpAdminJetpack = new WPAdminJetpackPage( driver );
			return this.wpAdminJetpack.connectWordPressCom();
		} );

		test.it( 'Can login into WordPress.com', function() {
			const loginFlow = new LoginFlow( driver, 'jetpackConnectUser' );
			return loginFlow.loginUsingExistingForm();
		} );

		test.it( 'Can approve connection on the authorization page', function() {
			this.jetpackAuthorizePage = new JetpackAuthorizePage( driver );
			return this.jetpackAuthorizePage.approveConnection();
		} );

		test.it( 'Can click the free plan button', function() {
			this.pickAPlanPage = new PickAPlanPage( driver );
			return this.pickAPlanPage.selectFreePlanJetpack();
		} );

		test.it( 'Is redirected back to the Jetpack dashboard with Jumpstart displayed', function() {
			return this.wpAdminJetpack.jumpstartDisplayed();
		} );
	} );

	test.describe( 'Connect from Jetpack.com using free plan: @parallel @jetpack', function() {
		this.bailSuite( true );

		test.before( function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'Can create wporg site', function() {
			this.jnFlow = new JetpackConnectFlow( driver, null, 'noJetpack' );
			return this.jnFlow.createJNSite();
		} );

		test.it( 'Can select Try it Free', function() {
			const jetpackComPage = new JetpackComPage( driver );
			return jetpackComPage.selectTryItFree();
		} );

		test.it( 'Can select free plan', function() {
			const pickAPlanPage = new PickAPlanPage( driver );
			return pickAPlanPage.selectFreePlan();
		} );

		test.it( 'Can start connection flow using JN site', function() {
			const connectPage = new JetpackConnectPage( driver );
			return connectPage.addSiteUrl( this.jnFlow.url );
		} );

		test.it( 'Can click Install Jetpack button in the instructions page', function() {
			const jetpackConnectInstall = new JetpackConnectInstallPage( driver, false );
			return jetpackConnectInstall.clickInstallButton();
		} );

		test.it( 'Can click the install button in the wp-admin plugin iframe', function() {
			const wpAdminPluginPopup = new WPAdminPluginPopup( driver );
			return wpAdminPluginPopup.installPlugin();
		} );

		test.it( 'Can click the plugin Activate button in the wp-admin updates page', function() {
			const wpAdminUpdatesPage = new WPAdminUpdatesPage( driver );
			return wpAdminUpdatesPage.activatePlugin();
		} );

		test.it( 'Can click the Connect Jetpack button', function() {
			const wpAdminPluginsPage = new WPAdminPluginsPage( driver );
			return wpAdminPluginsPage.connectJetpackAfterActivation();
		} );

		test.it( 'Can log into WP.com', function() {
			const user = dataHelper.getAccountConfig( 'jetpackConnectUser' );
			const loginPage = new LoginPage( driver );
			return loginPage.login( user[ 0 ], user[ 1 ] );
		} );

		test.it( 'Can confirm that current plan is Free', function() {
			const plansPage = new PlansPage( driver );
			assert( plansPage.confirmCurrentPlan( 'free' ) );
		} );
	} );

	test.describe( 'Connect via SSO: @parallel @jetpack', function() {
		this.bailSuite( true );

		test.before( function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'Can register new Subscriber user', () => {
			this.emailAddress = dataHelper.getEmailAddress( dataHelper.getNewBlogName(), signupInboxId );
			this.password = config.get( 'passwordForNewTestSignUps' );
			this.signupFlow = new SignUpFlow( driver, {
				emailAddress: this.emailAddress,
				password: this.password,
			} );
			return this.signupFlow
				.signupFreePlan()
				.then( () => this.signupFlow.activateAccount() )
				.then( () => driverManager.ensureNotLoggedIn( driver ) );
		} );

		test.it( 'Can log into WordPress.com', () => {
			this.loginFlow = new LoginFlow( driver );
			return this.loginFlow.login();
		} );

		test.it( 'Can log into site via Jetpack SSO', () => {
			return this.loginFlow.login( { jetpackSSO: true } );
		} );

		test.it( 'Add new user as Subscriber in wp-admin', () => {
			const wpAdminSidebar = new WPAdminSidebar( driver );
			return wpAdminSidebar.selectAddNewUser().then( () => {
				const newUserPage = new WPAdminNewUserPage( driver );
				return newUserPage.addUser( this.emailAddress );
			} );
		} );

		test.it( 'Log out from WP Admin', () => {
			return driverManager.ensureNotLoggedIn( driver ).then( () => {
				const wpAdminDashboardPage = new WPAdminDashboardPage(
					driver,
					dataHelper.getJetpackSiteName()
				);
				wpAdminDashboardPage.logout();
			} );
		} );

		test.it( 'Can log in as Subscriber', () => {
			const loginFlow = new LoginPage( driver, true );
			loginFlow.login( this.emailAddress, this.password );
		} );

		test.it( 'Can login via SSO into WP Admin', () => {
			const loginPage = new WPAdminLogonPage( driver, dataHelper.getJetpackSiteName(), {
				visit: true,
			} );
			return loginPage
				.logonSSO()
				.then( () => {
					let jetpackAuthPage = new JetpackAuthorizePage( driver );
					jetpackAuthPage.approveSSOConnection();
				} )
				.then( () => new WPAdminDashboardPage( driver ) );
		} );
	} );

	test.describe(
		'Connect from Jetpack.com using "Install Jetpack" button: @parallel @jetpack',
		function() {
			this.bailSuite( true );

			test.before( function() {
				return driverManager.ensureNotLoggedIn( driver );
			} );

			test.it( 'Can create wporg site', function() {
				this.jnFlow = new JetpackConnectFlow( driver, null, 'noJetpack' );
				return this.jnFlow.createJNSite();
			} );

			test.it( 'Can select Install Jetpack on Design Page', function() {
				const jetpackComPage = new JetpackComFeaturesDesignPage( driver );
				return jetpackComPage.installJetpack();
			} );

			test.it( 'Can start connection flow using JN site', function() {
				const connectPage = new JetpackConnectPage( driver );
				return connectPage.addSiteUrl( this.jnFlow.url );
			} );

			test.it( 'Can click Install Jetpack button in the instructions page', function() {
				const jetpackConnectInstall = new JetpackConnectInstallPage( driver, false );
				return jetpackConnectInstall.clickInstallButton();
			} );

			test.it( 'Can click the install button in the wp-admin plugin iframe', function() {
				const wpAdminPluginPopup = new WPAdminPluginPopup( driver );
				return wpAdminPluginPopup.installPlugin();
			} );

			test.it( 'Can click the plugin Activate button in the wp-admin updates page', function() {
				const wpAdminUpdatesPage = new WPAdminUpdatesPage( driver );
				return wpAdminUpdatesPage.activatePlugin();
			} );

			test.it( 'Can click the Connect Jetpack button', function() {
				const wpAdminPluginsPage = new WPAdminPluginsPage( driver );
				return wpAdminPluginsPage.connectJetpackAfterActivation();
			} );

			test.it( 'Can log into WP.com', function() {
				const user = dataHelper.getAccountConfig( 'jetpackConnectUser' );
				const loginPage = new LoginPage( driver );
				return loginPage.login( user[ 0 ], user[ 1 ] );
			} );

			test.it( 'Can select free plan', function() {
				const pickAPlanPage = new PickAPlanPage( driver );
				return pickAPlanPage.selectFreePlan();
			} );

			test.it( 'Can confirm that current plan is Free', function() {
				const plansPage = new PlansPage( driver );
				assert( plansPage.confirmCurrentPlan( 'free' ) );
			} );
		}
	);

	test.describe(
		'Connect from Jetpack.com Pricing page and buy paid plan: @parallel @jetpack',
		function() {
			this.bailSuite( true );

			test.before( function() {
				return driverManager.ensureNotLoggedIn( driver );
			} );

			test.it( 'We can set the sandbox cookie for payments', function() {
				return new WPHomePage( driver, { visit: true, culture: locale } ).setSandboxModeForPayments(
					sandboxCookieValue
				);
			} );

			test.it( 'Can create wporg site', function() {
				this.jnFlow = new JetpackConnectFlow( driver, null, 'noJetpack' );
				return this.jnFlow.createJNSite();
			} );

			test.it( 'Can select buy Premium on Pricing Page', function() {
				const jetpackComPage = new JetpackComPricingPage( driver );
				return jetpackComPage.buyPremium();
			} );

			test.it( 'Can start connection flow using JN site', function() {
				const connectPage = new JetpackConnectPage( driver );
				return connectPage.addSiteUrl( this.jnFlow.url );
			} );

			test.it( 'Can click Install Jetpack button in the instructions page', function() {
				const jetpackConnectInstall = new JetpackConnectInstallPage( driver, false );
				return jetpackConnectInstall.clickInstallButton();
			} );

			test.it( 'Can click the install button in the wp-admin plugin iframe', function() {
				const wpAdminPluginPopup = new WPAdminPluginPopup( driver );
				return wpAdminPluginPopup.installPlugin();
			} );

			test.it( 'Can click the plugin Activate button in the wp-admin updates page', function() {
				const wpAdminUpdatesPage = new WPAdminUpdatesPage( driver );
				return wpAdminUpdatesPage.activatePlugin();
			} );

			test.it( 'Can click the Connect Jetpack button', function() {
				const wpAdminPluginsPage = new WPAdminPluginsPage( driver );
				return wpAdminPluginsPage.connectJetpackAfterActivation();
			} );

			test.it( 'Can log into WP.com', function() {
				const user = dataHelper.getAccountConfig( 'jetpackConnectUser' );
				return new LoginPage( driver ).login( user[ 0 ], user[ 1 ] );
			} );

			test.it( 'Can wait for Jetpack get connected', function() {
				return new JetpackAuthorizePage( driver ).waitToDisappear();
			} );

			test.it( 'Can see the secure payment page and enter/submit test payment details', function() {
				const securePaymentComponent = new SecurePaymentComponent( driver );
				securePaymentComponent.payWithStoredCardIfPossible( testCreditCardDetails );
				securePaymentComponent.waitForCreditCardPaymentProcessing();
				return securePaymentComponent.waitForPageToDisappear();
			} );

			test.it( 'Can see Premium Thank You page', function() {
				assert( new CheckOutThankyouPage( driver ).isPremiumPlan() );
			} );
		}
	);

	test.describe(
		'Connect From WooCommerce plugin when Jetpack is not installed: @parallel @jetpack',
		function() {
			this.bailSuite( true );
			const countryStateCode = 'US:CO';
			const address = '2101 Blake St';
			const address2 = '';
			const city = 'Denver';
			const postalCode = '80205';
			const currency = 'USD';
			const productType = 'physical';

			test.before( function() {
				return driverManager.ensureNotLoggedIn( driver );
			} );

			test.it( 'Can create wporg site', function() {
				this.jnFlow = new JetpackConnectFlow( driver, null, 'wooCommerceNoJetpack' );
				return this.jnFlow.createJNSite();
			} );

			test.it( 'Can enter WooCommerce Wizard', function() {
				return new WPAdminDashboardPage( driver ).enterWooCommerceWizard();
			} );

			test.it( 'Can fill out and submit store information form', function() {
				return new WooWizardSetupPage( driver ).enterStoreDetailsAndSubmit( {
					countryStateCode,
					address,
					address2,
					city,
					postalCode,
					currency,
					productType,
				} );
			} );

			test.it( 'Can continue through payments information', function() {
				return new WooWizardPaymentsPage( driver ).selectContinue();
			} );

			test.it( 'Can continue through shipping information', function() {
				return new WooWizardShippingPage( driver ).selectContinue();
			} );

			test.it( 'Can continue through extras information', function() {
				return new WooWizardExtrasPage( driver ).selectContinue();
			} );

			test.it( 'Can activate Jetpack', function() {
				return new WooWizardJetpackPage( driver ).selectContinueWithJetpack();
			} );

			test.it( 'Can log into WP.com', function() {
				const user = dataHelper.getAccountConfig( 'jetpackConnectUser' );
				return new LoginPage( driver ).login( user[ 0 ], user[ 1 ] );
			} );

			test.it( 'Can wait for Jetpack get connected', function() {
				return new JetpackAuthorizePage( driver ).waitToDisappear();
			} );

			test.it( 'Can see the Woo wizard ready page', function() {
				return new WooWizardReadyPage( driver );
			} );
		}
	);

	test.describe(
		'Remote Installation Connect From Calypso, when Jetpack not installed: @parallel @jetpack',
		function() {
			this.bailSuite( true );
			let jnFlow;

			test.before( function() {
				return driverManager.ensureNotLoggedIn( driver );
			} );

			test.it( 'Can create wporg site', function() {
				jnFlow = new JetpackConnectFlow( driver, null, 'noJetpack' );
				return jnFlow.createJNSite();
			} );

			test.it( 'Can log in', function() {
				return new LoginFlow( driver, 'jetpackConnectUser' ).loginAndSelectMySite();
			} );

			test.it( 'Can add new site', function() {
				new SidebarComponent( driver ).addNewSite();
				return new AddNewSitePage( driver ).addSiteUrl( jnFlow.url );
			} );

			test.it( 'Can enter the Jetpack credentials and install Jetpack', function() {
				const jetpackConnectAddCredentialsPage = new JetpackConnectAddCredentialsPage( driver );
				return jetpackConnectAddCredentialsPage.enterDetailsAndConnect(
					jnFlow.username,
					jnFlow.password
				);
			} );

			test.it( 'Can wait for Jetpack get connected', function() {
				return new JetpackAuthorizePage( driver, { overrideABTests: false } ).waitToDisappear();
			} );

			test.it( 'Can click the free plan button', function() {
				return new PickAPlanPage( driver ).selectFreePlanJetpack();
			} );

			test.it( 'Can then see the Jetpack plan page in Calypso', function() {
				return new PlansPage( driver ).displayed();
			} );
		}
	);
} );
