import assert from 'assert';
import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager';

import PluginsPage from '../lib/pages/plugins-page';
import PluginsBrowserPage from '../lib/pages/plugins-browser-page';

import PluginDetailsPage from '../lib/pages/plugin-details-page';
import SidebarComponent from '../lib/components/sidebar-component';
import NavbarComponent from '../lib/components/navbar-component';
import LoginFlow from '../lib/flows/login-flow';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

var driver;

test.before( 'Start Browser', function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `Jetpack Sites on Calypso: '${ screenSize }'`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	const jetpackSiteId = config.get( 'jetpackSiteId' );

	test.before( 'Delete cookies and local storage, and log in', function() {
		driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	test.before( 'Can log in and go to the Plugins page', function() {
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

	test.describe( 'Can use the plugins browser to find Automattic plugins', function() {
		test.it( 'Open the plugins browser and find WP Job Manager by searching for Automattic', function() {
			const pluginVendor = 'Automattic';
			const pluginTitle = 'WP Job Manager';
			this.navbarComponent = new NavbarComponent( driver );
			this.navbarComponent.clickMySites();
			this.sidebarComponent = new SidebarComponent( driver );
			this.sidebarComponent.selectAddPlugin();
			this.pluginsBrowserPage = new PluginsBrowserPage( driver );
			this.pluginsBrowserPage.searchForPlugin( pluginVendor );
			this.pluginsBrowserPage.pluginTitledShown( pluginTitle, pluginVendor ).then( ( pluginDisplayed ) => {
				assert( pluginDisplayed, `The plugin titled ${pluginTitle} was not displayed` );
			} );
		} );
	} );
} );
