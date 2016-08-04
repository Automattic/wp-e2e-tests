import assert from 'assert';
import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager.js';

import PluginsPage from '../lib/pages/plugins-page.js';

import PluginDetailsPage from '../lib/pages/plugin-details-page.js'
import LoginFlow from '../lib/flows/login-flow.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

var driver;

test.before( 'Start Browser', function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `Jetpack Plugins Calypso: '${ screenSize }'`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	const jetpackSiteId = config.get( 'jetpackSiteId' );

	test.before( 'Delete cookies and local storage, and log in', function() {
		driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	test.it( 'Can log in and go to the Plugins page', function() {
		let loginFlow = new LoginFlow( driver, 'jetpackUser' );
		loginFlow.loginAndSelectPlugins(); //assuming that it lands on our JP site
	} );

	test.describe( 'Can activate Akismet', function() {
		test.it( 'Ensure Akismet is deactivated', function() {
			this.pluginsPage = new PluginsPage( driver );
			this.pluginsPage.viewPlugin( 'akismet' );
			this.pluginDetailsPage = new PluginDetailsPage( driver );
			this.pluginDetailsPage.waitForPlugin( 'akismet', jetpackSiteId );
			this.pluginDetailsPage.ensureDeactivated( 'akismet', jetpackSiteId );
			return this.pluginDetailsPage.goBack();
		} );

		test.it( 'Can view the plugin details to activate Akismet', function() {
			this.pluginsPage = new PluginsPage( driver );
			this.pluginsPage.viewPlugin( 'akismet' );
			this.pluginDetailsPage = new PluginDetailsPage( driver );
			this.pluginDetailsPage.waitForPlugin( 'akismet', jetpackSiteId );
			return this.pluginDetailsPage.clickActivateToggleForPlugin( 'akismet', jetpackSiteId );
		} );

		test.it( 'Scuccess message contains Akismet', function() {
			const expectedPartialText = 'Successfully activated Akismet';
			this.pluginDetailsPage = new PluginDetailsPage( driver );
			this.pluginDetailsPage.waitForSuccessNotice();
			return this.pluginDetailsPage.getSuccessNoticeText().then( function( successMessageText ) {
				assert.equal( successMessageText.indexOf( expectedPartialText ) > -1, true, `The success message '${successMessageText}' does not include '${expectedPartialText}'` );
			} );
		} );
	} );
} );
