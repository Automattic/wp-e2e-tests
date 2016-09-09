import test from 'selenium-webdriver/testing';
import config from 'config';

import * as driverManager from '../lib/driver-manager.js';

import LoginFlow from '../lib/flows/login-flow.js';

import PlansPage from '../lib/pages/plans-page.js';
import StatsPage from '../lib/pages/stats-page.js';

import SidebarComponent from '../lib/components/sidebar-component.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

var driver;

test.before( 'Start Browser', function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( 'Plans: (' + screenSize + ')', function() {
	this.timeout( mochaTimeOut );

	test.describe( 'Confirming Current Plan:', function() {
		this.bailSuite( true );

		test.before( 'Delete Cookies and Local Storage', function() {
			return driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.it( 'Login and Select My Site', function() {
			this.loginFlow = new LoginFlow( driver );
			return this.loginFlow.loginAndSelectMySite();
		} );

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

		test.it( 'Can Verify Current Plan', function() {
			//// An exercise left for the reader /////
		} );
	} );
} );
