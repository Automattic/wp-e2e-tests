import test from 'selenium-webdriver/testing';
import config from 'config';

import * as driverManager from '../lib/driver-manager.js';

import localization_data from '../../localization_data.json';
import GoogleFlow from '../lib/flows/google-flow.js';
import LandingPage from '../lib/pages/landing-page.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );

const locale_test = process.env.LOCALE_TEST || 'en-wordpress';

var driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( 'Search for WordPress on Google', function() {
	this.timeout( mochaTimeOut );
	var test_data = localization_data[ locale_test ];

	test.beforeEach( function() {
		driver.manage().deleteAllCookies();
		driverManager.deleteLocalStorage( driver );
	} );

	test.it( `Google search contains our ad`, function() {
		const googleFlow = new GoogleFlow( driver, 'desktop' );
		const that = this;
		return googleFlow.search( test_data.search_keyword, test_data ).then( searchPage => {
			that.searchPage = searchPage;
		} )
	} );

	test.it( `Our landing page exists`, function() {
		this.searchPage.getAdUrl().then( function( url ) {
			var landingPage = new LandingPage( driver, url );

		} );
	} );
} );
