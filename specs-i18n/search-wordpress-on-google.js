import test from 'selenium-webdriver/testing';
import config from 'config';

import * as driverManager from '../lib/driver-manager.js';

import localization_data from '../localization-data.json';
import GoogleFlow from '../lib/flows/google-flow.js';
import GoogleSearchPage from '../lib/pages/external/google-search.js';
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

test.after( function( done ) {
	// Wait between tests to not overload Google
	var wait_seconds = 45;
	this.timeout( ( wait_seconds + 2 ) * 1e3 );
	setTimeout( done, wait_seconds * 1e3);
} );

function doGoogleAdSearch( search_params ) {
	if ( locale === 'tr' ) {
		this.skip( 'Currently no advertising in this locale' );
	}
	var description = 'Search for "' + search_params.query + '" on ' + search_params.domain + ' from ' +
		search_params.comment_location;

	test.describe( description + ' @i18n', function() {
		this.timeout( mochaTimeOut );

		test.beforeEach( function() {
			driver.manage().deleteAllCookies();
			driverManager.deleteLocalStorage( driver );
		} );

		test.it( `Google search contains our ad`, function() {
			const googleFlow = new GoogleFlow( driver, 'desktop' );
			const that = this;
			googleFlow.search( search_params, test_data ).then( searchPage => {
				that.searchPage = new GoogleSearchPage( driver, 'https://' + test_data.wpcom_base_url );
			})
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
} );

