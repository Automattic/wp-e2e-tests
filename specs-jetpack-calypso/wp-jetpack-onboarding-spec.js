/** @format */
import assert from 'assert';
import test from 'selenium-webdriver/testing';
import config from 'config';

import * as dataHelper from '../lib/data-helper';
import * as driverManager from '../lib/driver-manager';

import JetpackAuthorizePage from '../lib/pages/jetpack-authorize-page';
import WporgCreatorPage from '../lib/pages/wporg-creator-page';
import LoginFlow from '../lib/flows/login-flow';
import SiteTitleTaglinePage from '../lib/pages/jetpack-onboarding/site-title-tagline-page';
import SiteTypePage from '../lib/pages/jetpack-onboarding/site-type-page';
import SetHomepagePage from '../lib/pages/jetpack-onboarding/set-homepage-page';
import ContactFormPage from '../lib/pages/jetpack-onboarding/contact-form-page';
import SummaryPage from '../lib/pages/jetpack-onboarding/summary-page';
import ViewPagePage from '../lib/pages/view-page-page';
import ViewSitePage from '../lib/pages/view-site-page';
import BusinessAddressPage from '../lib/pages/jetpack-onboarding/business-address-page';
import InstallWooCommercePage from '../lib/pages/jetpack-onboarding/install-woocommerce-page';
import WidgetContactInfoComponent from '../lib/components/widget-contact-info-component';
import WizardNavigationComponent from '../lib/components/wizard-navigation-component';
import ActivateStatsPage from '../lib/pages/jetpack-onboarding/activate-stats-page';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const onboardingUrlExt = '/wp-admin/admin.php?page=jetpack&action=onboard';

let driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `Jetpack Onboarding: (${ screenSize })`, function() {
	this.timeout( mochaTimeOut );

	test.describe( 'Onboard personal site with static homepage: @parallel @jetpack', function() {
		this.bailSuite( true );
		const blogTitle = dataHelper.randomPhrase();
		const blogTagline = dataHelper.randomPhrase();

		test.before( function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'Can create wporg site', function() {
			this.wporgCreator = new WporgCreatorPage( driver );
			this.wporgCreator.waitForWpadmin();
		} );

		test.it( 'Can get URL', function() {
			this.wporgCreator.getUrl().then( url => {
				this.url = url;
			} );
		} );

		test.it( 'Can navigate to onboarding flow', function() {
			return driver.get( this.url + onboardingUrlExt );
		} );

		test.it( 'Can skip all steps', function() {
			const wizardNavigationComponent = new WizardNavigationComponent( driver );
			return wizardNavigationComponent.skipStep()
				.then( () => wizardNavigationComponent.skipStep() )
				.then( () => wizardNavigationComponent.skipStep() )
				.then( () => wizardNavigationComponent.skipStep() )
				.then( () => wizardNavigationComponent.skipStep() )
				.then( () => {
					const summaryPage = new SummaryPage( driver );
					return summaryPage.countToDoSteps();
				} )
				.then( ( toDoCount ) => assert.equal( toDoCount, 4, 'Expected and actual steps are not equal.' ) );
		} );

		test.it( 'Can go back to first step in flow from summary page', function() {
			const summaryPage = new SummaryPage( driver );
			return summaryPage.visitStep( 1 );
		} );

		test.it( 'Can fill out site title and tagline', function() {
			const siteTitleTaglinePage = new SiteTitleTaglinePage( driver );
			siteTitleTaglinePage.enterTitle( blogTitle );
			siteTitleTaglinePage.enterTagline( blogTagline );
			return siteTitleTaglinePage.selectContinue();
		} );

		test.it( 'Can select Personal Site', function() {
			const siteTypePage = new SiteTypePage( driver );
			return siteTypePage.selectPersonalSite();
		} );

		test.it( 'Can select static page homepage', function() {
			const setHomepagePage = new SetHomepagePage( driver );
			return setHomepagePage.selectPage();
		} );

		test.it( 'Can select add a contact form', function() {
			const contactFormPage = new ContactFormPage( driver );
			return contactFormPage.selectAddContactForm();
		} );

		test.it( 'Can login into WordPress.com', function() {
			const loginFlow = new LoginFlow( driver, 'jetpackConnectUser' );
			return loginFlow.loginUsingExistingForm();
		} );

		test.it( 'Can approve connection on the authorization page', function() {
			const jetpackAuthorizePage = new JetpackAuthorizePage( driver );
			return jetpackAuthorizePage.approveConnection();
		} );

		test.it( 'Can select continue on add contact form', function() {
			const contactFormPage = new ContactFormPage( driver );
			contactFormPage.waitForPage();
			return contactFormPage.selectContinue();
		} );

		test.it( 'Can select continue on activate stats page', function() {
			const activateStatsPage = new ActivateStatsPage( driver );
			return activateStatsPage.selectContinue();
		} );

		test.it( 'Can see onboarding summary page', function() {
			const summaryPage = new SummaryPage( driver );
			return summaryPage.countToDoSteps()
				.then( toDoCount => assert.equal( toDoCount, 0, 'Expected and actual steps are not equal.' ) )
				.then( () => summaryPage.selectVisitSite() );
		} );

		test.it( 'Can see site home page', function() {
			const viewPagePage = new ViewPagePage( driver );
			return viewPagePage.pageTitle()
				.then( title => assert.equal( title.toUpperCase(), 'HOME PAGE', 'Homepage not set to a static page' ) );
		} );
	} );

	test.describe( 'Onboard business site with posts homepage: @parallel @jetpack', function() {
		this.bailSuite( true );
		const blogTitle = dataHelper.randomPhrase();
		const blogTagline = dataHelper.randomPhrase();
		const businessName = 'Testing Inc.';
		const countryCode = 'AU';
		const address = '888 Queen Street';
		const city = 'Brisbane';
		const stateCode = 'QLD';
		const postalCode = '4000';

		test.before( function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'Can create wporg site', function() {
			this.wporgCreator = new WporgCreatorPage( driver );
			this.wporgCreator.waitForWpadmin();
		} );

		test.it( 'Can get URL', function() {
			this.wporgCreator.getUrl().then( url => {
				this.url = url;
			} );
		} );

		test.it( 'Can navigate to onboarding flow', function() {
			return driver.get( this.url + onboardingUrlExt );
		} );

		test.it( 'Can fill out site title and tagline', function() {
			const siteTitleTaglinePage = new SiteTitleTaglinePage( driver );
			siteTitleTaglinePage.enterTitle( blogTitle );
			siteTitleTaglinePage.enterTagline( blogTagline );
			return siteTitleTaglinePage.selectContinue();
		} );

		test.it( 'Can select Business Site', function() {
			const siteTypePage = new SiteTypePage( driver );
			return siteTypePage.selectBusinessSite();
		} );

		test.it( 'Can select posts homepage', function() {
			const setHomepagePage = new SetHomepagePage( driver );
			return setHomepagePage.selectPosts();
		} );

		test.it( 'Can skip add a contact form', function() {
			const wizardNavigationComponent = new WizardNavigationComponent( driver );
			return wizardNavigationComponent.skipStep();
		} );

		test.it( 'Can select add a business address', function() {
			const businessAddressPage = new BusinessAddressPage( driver );
			return businessAddressPage.selectAddBusinessAddress();
		} );

		test.it( 'Can login into WordPress.com', function() {
			const loginFlow = new LoginFlow( driver, 'jetpackConnectUser' );
			return loginFlow.loginUsingExistingForm();
		} );

		test.it( 'Can approve connection on the authorization page', function() {
			const jetpackAuthorizePage = new JetpackAuthorizePage( driver );
			return jetpackAuthorizePage.approveConnection();
		} );

		test.it( 'Can enter address on business address page', function() {
			const businessAddressPage = new BusinessAddressPage( driver );
			return businessAddressPage.enterBusinessAddressAndSubmit( businessName, address, city, stateCode, postalCode, countryCode )
				.then( () => businessAddressPage.selectContinue() );
		} );

		test.it( 'Can make business an online store', function() {
			const installWooCommercePage = new InstallWooCommercePage( driver );
			return installWooCommercePage.selectSellOnline();
		} );

		test.it( 'Can select continue on activate stats page', function() {
			const activateStatsPage = new ActivateStatsPage( driver );
			return activateStatsPage.selectContinue();
		} );

		test.it( 'Can see onboarding summary page', function() {
			const summaryPage = new SummaryPage( driver );
			return summaryPage.countToDoSteps()
				.then( toDoCount => assert.equal( toDoCount, 1, 'Expected and actual steps are not equal.' ) )
				.then( () => summaryPage.selectVisitSite() );
		} );

		test.it( 'Can see site home page', function() {
			const viewSitePage = new ViewSitePage( driver );
			const widgetContactInfoComponent = new WidgetContactInfoComponent( driver );
			const businessAddress = [ address, city, stateCode, postalCode, countryCode];
			return viewSitePage.siteTitle()
				.then( title => assert.equal( title.toUpperCase(), blogTitle.toUpperCase(), 'Site title not is not correct' ) )
				.then( () => viewSitePage.siteTagline() )
				.then( tagline => assert.equal( tagline, blogTagline, 'Site tagline not is not correct' ) )
				.then( () => widgetContactInfoComponent.getName() )
				.then( siteBusinessName => assert.equal( siteBusinessName.toUpperCase(), businessName.toUpperCase(), 'Business name not found on page' ) )
				.then( () => widgetContactInfoComponent.getAddress() )
				.then( siteBusinessAddress => assert.equal( siteBusinessAddress, businessAddress.join( ' ' ), 'Business address not found on page' ) );
		} );
	} );

	test.describe( 'Onboard business site with static homepage when already logged in to WordPress: @parallel @jetpack', function() {
		this.bailSuite( true );
		const blogTitle = dataHelper.randomPhrase();
		const blogTagline = dataHelper.randomPhrase();

		test.before( function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'Can login into WordPress.com', function() {
			const loginFlow = new LoginFlow( driver, 'jetpackConnectUser' );
			return loginFlow.login();
		} );

		test.it( 'Can create wporg site', function() {
			this.wporgCreator = new WporgCreatorPage( driver );
			this.wporgCreator.waitForWpadmin();
		} );

		test.it( 'Can get URL', function() {
			this.wporgCreator.getUrl().then( url => {
				this.url = url;
			} );
		} );

		test.it( 'Can navigate to onboarding flow', function() {
			return driver.get( this.url + onboardingUrlExt );
		} );

		test.it( 'Can fill out site title and tagline', function() {
			const siteTitleTaglinePage = new SiteTitleTaglinePage( driver );
			siteTitleTaglinePage.enterTitle( blogTitle );
			siteTitleTaglinePage.enterTagline( blogTagline );
			return siteTitleTaglinePage.selectContinue();
		} );

		test.it( 'Can select Business Site', function() {
			const siteTypePage = new SiteTypePage( driver );
			return siteTypePage.selectBusinessSite();
		} );

		test.it( 'Can select static homepage', function() {
			const setHomepagePage = new SetHomepagePage( driver );
			return setHomepagePage.selectPage();
		} );

		test.it( 'Can skip add a contact form', function() {
			const wizardNavigationComponent = new WizardNavigationComponent( driver );
			return wizardNavigationComponent.skipStep();
		} );

		test.it( 'Can skip add a business address', function() {
			const wizardNavigationComponent = new WizardNavigationComponent( driver );
			return wizardNavigationComponent.skipStep();
		} );

		test.it( 'Can make business an online store', function() {
			const installWooCommercePage = new InstallWooCommercePage( driver );
			return installWooCommercePage.selectSellOnline();
		} );

		test.it( 'Can select activate on activate stats page', function() {
			const activateStatsPage = new ActivateStatsPage( driver );
			return activateStatsPage.selectActivateStats();
		} );

		test.it( 'Can approve connection on the authorization page', function() {
			const jetpackAuthorizePage = new JetpackAuthorizePage( driver );
			return jetpackAuthorizePage.approveConnection();
		} );

		test.it( 'Can select activate on activate stats page', function() {
			const activateStatsPage = new ActivateStatsPage( driver );
			return activateStatsPage.selectContinue();
		} );

		test.it( 'Can see onboarding summary page', function() {
			const summaryPage = new SummaryPage( driver );
			return summaryPage.countToDoSteps()
				.then( toDoCount => assert.equal( toDoCount, 2, 'Expected and actual steps are not equal.' ) )
				.then( () => summaryPage.selectVisitSite() );
		} );

		test.it( 'Can see site home page', function() {
			const viewSitePage = new ViewSitePage( driver );
			return viewSitePage.siteTitle()
				.then( title => assert.equal( title.toUpperCase(), blogTitle.toUpperCase(), 'Site title not is not correct' ) )
				.then( () => viewSitePage.siteTagline() )
				.then( tagline => assert.equal( tagline, blogTagline, 'Site tagline not is not correct' ) );
		} );
	} );
} );
