import assert from 'assert';
import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager';
import * as dataHelper from '../lib/data-helper';

import SettingsPage from '../lib/pages/settings-page';

import LoginFlow from '../lib/flows/login-flow';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `[${host}] Jetpack Settings on Calypso: (${screenSize}) @jetpack`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.before( function() {
		driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	test.before( function() {
		let loginFlow = new LoginFlow( driver, 'jetpackUser' + host );
		loginFlow.loginAndSelectSettings();
		this.settingsPage = new SettingsPage( driver );
		return this.settingsPage.selectWriting();
	} );

	test.describe( 'Can see Media Settings', function() {
		test.it( 'Can see media settings section', function() {
			this.settingsPage.mediaSettingsSectionDisplayed().then( ( shown ) => {
				assert( shown, 'Can\'t see the media settings section under the Writing settings' );
			} );
		} );

		test.it( 'Can see the Photon toggle switch', function() {
			this.settingsPage.photonToggleDisplayed().then( ( shown ) => {
				assert( shown, 'Can\'t see the Photon setting toggle under the Writing settings' );
			} );
		} );

		test.it( 'Can see the Carousel toggle switch', function() {
			this.settingsPage.carouselToggleDisplayed().then( ( shown ) => {
				assert( shown, 'Can\'t see the carousel setting toggle under the Writing settings' );
			} );
		} );

		test.it( 'Can see the Carousel background color drop down', function() {
			this.settingsPage.carouseBackgroundColorDisplayed().then( ( shown ) => {
				assert( shown, 'Can\'t see the carousel background color setting toggle under the Writing settings' );
			} );
		} );
	} );
} );
