import test from 'selenium-webdriver/testing';
import config from 'config';
import assert from 'assert';

import * as driverManager from '../lib/driver-manager';
import * as dataHelper from '../lib/data-helper';

import LoginFlow from '../lib/flows/login-flow';

import PlansPage from '../lib/pages/plans-page';
import StatsPage from '../lib/pages/stats-page';

import SidebarComponent from '../lib/components/sidebar-component';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

var driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `[${host}] Jetpack Plans: (${screenSize}) @jetpack`, function() {
	this.timeout( mochaTimeOut );

	test.xdescribe( 'Comparing Plans:', function() {
		this.bailSuite( true );

		test.before( function() {
			return driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.it( 'Login and Select My Site', function() {
			this.loginFlow = new LoginFlow( driver, 'jetpackUser' + host );
			return this.loginFlow.loginAndSelectMySite();
		} );

		test.describe( 'Can compare plans', function() {
			test.it( 'Can Select Plans', function() {
				this.statsPage = new StatsPage( driver );
				this.statsPage.waitForPage();
				this.sideBarComponent = new SidebarComponent( driver );
				return this.sideBarComponent.selectPlan();
			} );

			test.it( 'Can See Plans', function() {
				this.plansPage = new PlansPage( driver );
				return this.plansPage.waitForPage();
			} );

			test.it( 'Can See Jetpack Plans for Comparison', function() {
				this.plansPage = new PlansPage( driver );
				this.plansPage.openPlansTab();
				this.plansPage.waitForComparison();
				return this.plansPage.planTypesShown( 'jetpack' ).then( ( displayed ) => {
					assert( displayed, 'The Jetpack plans are NOT displayed' );
				} );
			} );

			test.it( 'Can Verify Current Plan', function() {
				const planName = 'premium';
				return this.plansPage.confirmCurrentPlan( planName ).then( function( present ) {
					assert( present, `Failed to detect correct plan (${planName})` );
				} );
			} );
		} );
	} );

	test.describe( 'Purchase Professional Plan:', function() {
		this.bailSuite( true );

		test.before( function() {
			return driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.it( 'Can log into WordPress.com', () => {
			this.loginFlow = new LoginFlow( driver, 'jetpackUser' + host );
			return this.loginFlow.login();
		} );

		test.it( 'Can log into site via Jetpack SSO', () => {
			return this.loginFlow.login( { jetpackSSO: true } );
		} );
	} );
} );
