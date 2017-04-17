import test from 'selenium-webdriver/testing';
import config from 'config';
import assert from 'assert';

import * as driverManager from '../lib/driver-manager.js';

import LoginFlow from '../lib/flows/login-flow.js';

import PlansPage from '../lib/pages/plans-page.js';
import StatsPage from '../lib/pages/stats-page.js';

import SidebarComponent from '../lib/components/sidebar-component.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

var driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( 'Plans: (' + screenSize + ') @parallel', function() {
	this.timeout( mochaTimeOut );

	test.describe( 'Comparing Plans:', function() {
		this.bailSuite( true );

		test.before( function() {
			return driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.it( 'Login and Select My Site', function() {
			this.loginFlow = new LoginFlow( driver );
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

			test.it( 'Can Compare Plans', function() {
				this.plansPage = new PlansPage( driver );
				this.plansPage.openPlansTab();
				return this.plansPage.waitForComparison();
			} );

			test.it( 'Can Verify Current Plan', function() {
				const planName = 'premium';
				return this.plansPage.confirmCurrentPlan( planName ).then( function( present ) {
					assert( present, `Failed to detect correct plan (${planName})` );
				} );
			} );
		} );

		//test.describe( 'Can purchase plans', function() {
		//	test.it( 'Can purchase premium', function() {
		//		let plansPage = new PlansPage( driver );
		//		let shoppingCart = new ShoppingCartWidgetComponent( driver );
		//
		//		shoppingCart.empty();
		//		//plansPage.purchasePremium(); //TODO: make this repeatable
		//	} );
		//} );
	} );
} );
