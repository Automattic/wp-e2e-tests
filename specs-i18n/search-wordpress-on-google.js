import test from 'selenium-webdriver/testing';
import config from 'config';

import * as driverManager from '../lib/driver-manager.js';

import GoogleFlow from '../lib/flows/google-flow.js';
import LandingPage from '../lib/pages/landing-page.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );

const language = process.env.LANGUAGE || 'en';
const location = process.env.LOCATION || 'New York City';

var driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( 'Search for WordPress on Google', function() {
	this.timeout( mochaTimeOut );

	test.beforeEach( function() {
		driver.manage().deleteAllCookies();
		driverManager.deleteLocalStorage( driver );
	} );

	test.it( `Google search contains our ad`, function() {
		const googleFlow = new GoogleFlow( driver, 'desktop' );
		var that = this;
		googleFlow.search( 'wordpress', { location, language, googleDomain: 'com', wpcom_base_url: 'wordpress.com' } ).then( searchPage => {
			that.searchPage = searchPage;
		} )
	} );

	test.it( `Our landing page exists`, function() {
		this.searchPage.getAdUrl().then( function( url ) {
			var landingPage = new LandingPage( driver, url );

		} );
	} );
} );
