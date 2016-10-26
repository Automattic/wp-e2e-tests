import assert from 'assert';
import test from 'selenium-webdriver/testing';
import config from 'config';
import ProfilePage from '../lib/pages/profile-page.js';
import WPHomePage from '../lib/pages/wp-home-page.js';
import * as driverManager from '../lib/driver-manager.js';
import * as driverHelper from '../lib/driver-helper.js';
import LoginPage from '../lib/pages/login-page.js';
import LoginFlow from '../lib/flows/login-flow.js';

import NavbarComponent from '../lib/components/navbar-component.js';

const mochaVisDiffTimeOut = config.get( 'mochaVisDiffTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );

var Eyes = require( 'eyes.selenium' ).Eyes;
var eyes = new Eyes();
var driver, screenSize, screenSizeName;

eyes.setApiKey( config.get( 'eyesKey' ) );

if ( process.env.CIRCLE_BUILD_NUM ) {
	eyes.setBatch( `WordPress.com CircleCI Build #${process.env.CIRCLE_BUILD_NUM}`, process.env.CIRCLE_BUILD_NUM );
}

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
	screenSize = driverManager.getSizeAsObject();
	screenSizeName = driverManager.currentScreenSize();
} );

test.describe( 'WordPress.com Visual Diff', function() {
	this.timeout( mochaVisDiffTimeOut );

	test.beforeEach( function() {
		driver.manage().deleteAllCookies();
	} );

	test.it( 'Can Log In And Out', function() {
		eyes.open( driver, 'WordPress.com', 'Log In/Out [' + screenSizeName + ']', screenSize );

		let loginPage = new LoginPage( driver, true );
		driverHelper.eyesScreenshot( driver, eyes, 'Login Page' );

		let loginFlow = new LoginFlow( driver, 'visualUser' );
		loginFlow.login();

		driverHelper.eyesScreenshot( driver, eyes, 'Reader' );
		let navbarComponent = new NavbarComponent( driver );
		navbarComponent.clickProfileLink();

		let profilePage = new ProfilePage( driver );
		driverHelper.eyesScreenshot( driver, eyes, 'Profile' );
		profilePage.clickSignOut();

		driver.getCurrentUrl().then( function( url ) {
			let visit = false;
			if ( url.match( /\?apppromo$/ ) ) {
				visit = true;
			}

			let wpHomePage = new WPHomePage( driver, { visit: visit } );
			wpHomePage.displayed().then( function( displayed ) {
				driverHelper.eyesScreenshot( driver, eyes, 'WordPress.com HomePage' );
				assert.equal( displayed, true, 'WordPress.com home page is not displayed.' );
			} );
		} );

		eyes.close();
	} );
} );

test.after( function() {
	this.timeout( mochaVisDiffTimeOut );

	eyes.abortIfNotClosed();
} );
