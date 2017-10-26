/** @format */
import test from 'selenium-webdriver/testing';
import config from 'config';
import assert from 'assert';

import * as driverManager from '../lib/driver-manager';
import * as dataHelper from '../lib/data-helper';

import AddNewSitePage from '../lib/pages/add-new-site-page';
import PickAPlanPage from '../lib/pages/signup/pick-a-plan-page';
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
			this.wporgCreator.waitForWpadmin();
		} );

		test.it( 'Can get URL', () => {
			this.wporgCreator.getUrl().then( url => {
				this.url = url;
			} );
		} );

		test.it( 'Can log in', () => {
			const loginFlow = new LoginFlow( driver, 'jetpackConnectUser' );
			loginFlow.loginAndSelectMySite();

			this.sidebarComponent = new SidebarComponent( driver );

			// ensure we are in A/B variant that allows adding jp site from single-site account
			driver.getCurrentUrl().then( urlDisplayed => {
				this.sidebarComponent.setABTestControlGroupsInLocalStorage( urlDisplayed );
			} );
		} );

		/*
		test.it( 'Can disconnect existing jetpack sites', () => {
			this.sideBarComponent.selectSiteSwitcher();
			this.sideBarComponent.searchForSite( 'ninja' );
		}
*/
		test.it( 'Can add new site', () => {
			this.sidebarComponent.addNewSite( driver );
			const addNewSitePage = new AddNewSitePage( driver );
			addNewSitePage.addSiteUrl( this.url );
		} );

		test.it( 'Can click the free plan button', () => {
			this.pickAPlanPage = new PickAPlanPage( driver );
			return this.pickAPlanPage.selectFreePlanJetpack();
		} );

		test.it( 'Has site URL in route', done => {
			const siteSlug = this.url.replace( /^https?:\/\//, '' );
			console.log( siteSlug );
			return driver.getCurrentUrl().then( url => {
				if ( url.includes( this.url ) ) {
					return done();
				}
				done( 'Route does not include site slug ' + url );
			} );
		} );
	} );
} );
