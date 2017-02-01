import assert from 'assert';
import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager';
import * as dataHelper from '../lib/data-helper';

import PluginsPage from '../lib/pages/plugins-page';
import PluginsBrowserPage from '../lib/pages/plugins-browser-page';

import PluginDetailsPage from '../lib/pages/plugin-details-page';
import SidebarComponent from '../lib/components/sidebar-component';
import NavbarComponent from '../lib/components/navbar-component';
import LoginFlow from '../lib/flows/login-flow';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

var driver;

test.before( 'Start Browser', function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `${host} Jetpack Sites on Calypso: '${ screenSize }'`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.before( 'Delete cookies and local storage, and log in', function() {
		driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	test.before( 'Can log in and go to the Plugins page', function() {
		let loginFlow = new LoginFlow( driver, 'jetpackUser' + host );
		loginFlow.loginAndSelectPlugins();
	} );

	test.describe( 'Can activate Hello Dolly', function() {
		test.it( 'Ensure Hello Dolly is deactivated', function() {
			this.pluginsPage = new PluginsPage( driver );
			this.pluginsPage.viewPlugin( 'hello-dolly' );
			this.pluginDetailsPage = new PluginDetailsPage( driver );
			this.pluginDetailsPage.waitForPlugin();
			this.pluginDetailsPage.ensureDeactivated();
			return this.pluginDetailsPage.goBack();
		} );

		test.it( 'Can view the plugin details to activate Hello Dolly', function() {
			this.pluginsPage = new PluginsPage( driver );
			this.pluginsPage.viewPlugin( 'hello-dolly' );
			this.pluginDetailsPage = new PluginDetailsPage( driver );
			this.pluginDetailsPage.waitForPlugin();
			return this.pluginDetailsPage.clickActivateToggleForPlugin();
		} );

		test.it( 'Success message contains Hello Dolly', function() {
			const expectedPartialText = 'Successfully activated Hello Dolly';
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
