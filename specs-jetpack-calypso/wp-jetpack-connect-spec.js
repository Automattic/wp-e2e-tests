/** @format */
import test from 'selenium-webdriver/testing';
import config from 'config';
import assert from 'assert';

import * as driverManager from '../lib/driver-manager';
import * as dataHelper from '../lib/data-helper';

import WporgCreatorPage from '../lib/pages/wporg-creator-page';
import LoginFlow from '../lib/flows/login-flow';
import SidebarComponent from '../lib/components/sidebar-component';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

var driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `Jetpack Connect: (${ screenSize }) @jetpack`, function() {
	this.timeout( mochaTimeOut );

	test.describe( 'Connect From Calypso:', function() {
		this.bailSuite( true );

		test.before( function() {
			return driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.it( 'Can create wporg site', () => {
			this.wporgCreator = new WporgCreatorPage( driver );
			return this.wporgCreator.waitForWpadmin();
		} );

		test.it( 'Can get URL', () => {
			this.wporgCreator.getUrl().then( url => {
				this.url = url;
			} );
		} );

		test.it( 'Can add new site', () => {
			const loginFlow = new LoginFlow( driver );
			loginFlow.loginAndSelectMySite();

			const sidebarComponent = new SidebarComponent( driver );
			sidebarComponent.addNewSite( driver );

			// some A/B test in play here?
		} );
	} );
} );
