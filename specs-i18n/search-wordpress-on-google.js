/** @format */

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

let driver;

test.before( async function() {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

test.after( function( done ) {
	// Wait between tests to not overload Google
	let wait_seconds = 10;
	this.timeout( ( wait_seconds + 2 ) * 1e3 );
	setTimeout( done, wait_seconds * 1e3 );
} );

function doGoogleAdSearch( search_params ) {
	let description =
		'Search for "' +
		search_params.query +
		'" on ' +
		search_params.domain +
		' from ' +
		search_params.comment_location;

	test.describe( description + ' @i18n (' + locale + ')', function() {
		this.timeout( mochaTimeOut );
		this.bailSuite( true );

		test.before( function() {
			if ( locale === 'tr' || locale === 'ar' || locale === 'zh-tw' ) {
				this.skip( 'Currently no advertising in this locale' );
			}
		} );

		test.beforeEach( async function() {
			await driver.manage().deleteAllCookies();
			await driverManager.deleteLocalStorage( driver );
		} );

		test.it( 'Google search contains our ad', async function() {
			const googleFlow = new GoogleFlow( driver );
			await googleFlow.resize( 'desktop' );
			const that = this;
			await googleFlow.search( search_params, test_data );
			const searchPage = await GoogleSearchPage.Expect( driver );
			await searchPage.createAdLink( 'https://' + test_data.wpcom_base_url );
			if ( await searchPage.adExists() ) {
				that.searchPage = searchPage;
			}
		} );

		test.it( 'Our landing page exists', async function() {
			const that = this;
			let url = await this.searchPage.getAdUrl();
			that.landingPage = await LandingPage.Visit( driver, url );
			return await that.landingPage.checkURL();
		} );

		test.it( 'Localized string found on landing page', async function() {
			await this.landingPage.checkLocalizedString( test_data.wpcom_landing_page_string );
		} );
	} );
}

test_data.google_searches.forEach( function( search_params ) {
	doGoogleAdSearch( search_params );
} );
