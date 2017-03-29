import test from 'selenium-webdriver/testing';
import config from 'config';

import * as driverManager from '../lib/driver-manager.js';

import localization_data from '../../localization_data.json';
import GoogleFlow from '../lib/flows/google-flow.js';
import LandingPage from '../lib/pages/landing-page.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );

const locale_test = process.env.LOCALE_TEST || 'en';
const test_data = localization_data[ locale_test ];

var driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

function doGoogleAdSearch( search_params ) {
	var description = 'Search for "' + search_params.query + '" on Google from ' + search_params.originating_location;

	test.describe( description, function() {
		this.timeout( mochaTimeOut );

		test.beforeEach( function() {
			driver.manage().deleteAllCookies();
			driverManager.deleteLocalStorage( driver );
		} );

		test.it( `Google search contains our ad`, function() {
			const googleFlow = new GoogleFlow( driver, 'desktop' );
			const that = this;
			return googleFlow.search( search_params, test_data ).then( searchPage => {
				that.searchPage = searchPage;
			} )
		} );

		test.it( `Our landing page exists`, function() {
			if( ! this.searchPage ) {
				this.skip( 'Depends on previous test passing' );
			}
			this.searchPage.getAdUrl().then( function( url ) {
				var landingPage = new LandingPage( driver, url );

			} );
		} );
	} );
}

test_data.google_searches.forEach( function( search_params ) {
	doGoogleAdSearch( search_params );
} );

