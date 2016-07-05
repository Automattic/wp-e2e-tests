import test from 'selenium-webdriver/testing';
import config from 'config';
import assert from 'assert';

import * as driverManager from '../lib/driver-manager';
import * as dataHelper from '../lib/data-helper';
import LoginFlow from '../lib/flows/login-flow';
import CustomizerPage from '../lib/pages/customizer-page';
import SidebarComponent from '../lib/components/sidebar-component';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

var driver;

test.before( 'Start Browser', function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( 'Post-NUX Flows (' + screenSize + ')', function() {
	this.timeout( mochaTimeOut );

	test.describe( 'Sign in as a post NUX user and load the customizer', function() {
		this.bailSuite( true );

		test.it( 'Ensure we are not logged in as anyone', function() {
			return driverManager.ensureNotLoggedIn( driver );
		} );

		test.it( 'Sign in as a post NUX user and choose customize theme', function() {
			this.loginFlow = new LoginFlow( driver, 'postNUXUser' );
			this.loginFlow.loginAndSelectMySite();
			this.sidebarComponent = new SidebarComponent( driver );
			return this.sidebarComponent.customizeTheme();
		} );

		test.it( 'Can see the customizer', function() {
			const customizerPage = new CustomizerPage( driver );
			customizerPage.displayed().then( ( displayed ) => {
				assert( displayed, 'The customizer page was not displayed' );
			} );
		} );

		test.describe( 'Customize and Preview site', function() {
			test.describe( 'Can customize the site identity ', function() {
				test.it( 'Can expand site identity', function() {
					const customizerPage = new CustomizerPage( driver );
					return customizerPage.expandSiteIdentity();
				} );

				test.it( 'Can update and view site title', function() {
					const newSiteTitle = dataHelper.randomPhrase();
					const customizerPage = new CustomizerPage( driver );
					customizerPage.setTitle( newSiteTitle );
					customizerPage.previewTitle().then( ( titleShown ) => {
						assert.equal( titleShown.toUpperCase(), newSiteTitle.toUpperCase(), 'The customizer preview title shown does not reflect the title input' );
					} );
				} );

				test.it( 'Can update and view site tagline', function() {
					if ( screenSize === 'mobile' ) {
						console.log( 'Preview of Taglines not supported on mobile - skipping test' );
						return true;
					}
					const newTagline = dataHelper.randomPhrase();
					const customizerPage = new CustomizerPage( driver );
					customizerPage.setTagline( newTagline );
					customizerPage.previewTagline().then( ( taglineShown ) => {
						assert.equal( taglineShown.toUpperCase(), newTagline.toUpperCase(), 'The customizer preview tagline shown does not reflect the tagline input' );
					} );
				} );

				test.it( 'Direct Manipulation: clicking the icon on title jumps to site title field', function() {
					const customizerPage = new CustomizerPage( driver );
					customizerPage.clickSiteTitleIconInPreview();
					assert( customizerPage.waitForTitleFieldDisplayed(), 'The title field is not displayed' );
				} );

				test.it( 'Close the customizer', function() {
					const customizerPage = new CustomizerPage( driver );
					return customizerPage.close();
				} );
			} );
		} );
	} );
} );
