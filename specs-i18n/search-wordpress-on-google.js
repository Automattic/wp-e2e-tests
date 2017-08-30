import test from 'selenium-webdriver/testing';
import config from 'config';

import * as driverManager from '../lib/driver-manager.js';

import localization_data from '../localization-data.json';
import GoogleFlow from '../lib/flows/google-flow.js';
import LandingPage from '../lib/pages/landing-page.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );

const locale = driverManager.currentLocale();
const test_data = localization_data[ locale ];

var driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.afterEach( function() {
	this.sleep( 15000 );
} );

function doGoogleAdSearch( search_params ) {
	var description = 'Search for "' + search_params.query + '" on Google from ' +
		search_params.originating_location +
		( search_params.originating_location_english
			? ' (' + search_params.originating_location_english + ')'
			: '' );

	test.describe( description + ' @i18n', function() {
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
			const that = this;
			if ( ! this.searchPage ) {
				this.skip( 'Depends on previous test passing' );
			}
			this.searchPage.getAdUrl().then( function( url ) {
				that.landingPage = new LandingPage( driver, url );
			} );
		} );

		test.it( `Localized string found on landing page`, function() {
			if ( ! this.landingPage ) {
				this.skip( 'Depends on previous test passing' );
			}
			this.landingPage.checkLocalizedString( test_data.wpcom_landing_page_string );
		} );
	} );
}

test_data.google_searches.forEach( function( search_params ) {
	doGoogleAdSearch( search_params );
	if ( process.env.CIRCLECI === 'true' ) {
		sleep( 15000 );
	}
} );

