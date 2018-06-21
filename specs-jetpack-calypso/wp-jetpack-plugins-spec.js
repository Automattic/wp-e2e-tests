/** @format */

import assert from 'assert';
import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager';
import * as dataHelper from '../lib/data-helper';

import PluginsPage from '../lib/pages/plugins-page';
import PluginsBrowserPage from '../lib/pages/plugins-browser-page';

import PluginDetailsPage from '../lib/pages/plugin-details-page';
import LoginFlow from '../lib/flows/login-flow';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;

test.before( async function() {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

test.describe(
	`[${ host }] Jetpack Sites on Calypso - Existing Plugins: (${ screenSize }) @jetpack`,
	function() {
		this.timeout( mochaTimeOut );
		this.bailSuite( true );

		test.before( async function() {
			await driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.before( async function() {
			let loginFlow = new LoginFlow( driver, 'jetpackUser' + host );
			await loginFlow.loginAndSelectManagePlugins();
		} );

		test.describe( 'Can activate Hello Dolly', function() {
			test.it( 'Ensure Hello Dolly is deactivated', async function() {
				const pluginsPage = await PluginsPage.Expect( driver );
				await pluginsPage.viewPlugin( 'hello' );
				const pluginDetailsPage = await PluginDetailsPage.Expect( driver );
				await pluginDetailsPage.waitForPlugin();
				await pluginDetailsPage.ensureDeactivated();
				return await pluginDetailsPage.goBack();
			} );

			test.it( 'Can view the plugin details to activate Hello Dolly', async function() {
				const pluginsPage = await PluginsPage.Expect( driver );
				await pluginsPage.viewPlugin( 'hello' );
				const pluginDetailsPage = await PluginDetailsPage.Expect( driver );
				await pluginDetailsPage.waitForPlugin();
				return await pluginDetailsPage.clickActivateToggleForPlugin();
			} );

			test.it( 'Success message contains Hello Dolly', async function() {
				const expectedPartialText = 'Successfully activated Hello Dolly';
				const pluginDetailsPage = await PluginDetailsPage.Expect( driver );
				await pluginDetailsPage.waitForSuccessNotice();
				let successMessageText = await pluginDetailsPage.getSuccessNoticeText();
				return assert.equal(
					successMessageText.indexOf( expectedPartialText ) > -1,
					true,
					`The success message '${ successMessageText }' does not include '${ expectedPartialText }'`
				);
			} );
		} );
	}
);

test.describe(
	`[${ host }] Jetpack Sites on Calypso - Searching Plugins: (${ screenSize }) @jetpack`,
	function() {
		this.timeout( mochaTimeOut );
		this.bailSuite( true );

		test.before( async function() {
			await driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.before( async function() {
			let loginFlow = new LoginFlow( driver, 'jetpackUser' + host );
			await loginFlow.loginAndSelectPlugins();
		} );

		test.describe( 'Can use the plugins browser to find Automattic plugins', function() {
			test.it(
				'Open the plugins browser and find WP Job Manager by searching for Automattic',
				async function() {
					const pluginVendor = 'WP Job Manager';
					const pluginTitle = 'WP Job Manager';
					this.pluginsBrowserPage = new PluginsBrowserPage( driver );
					await this.pluginsBrowserPage.searchForPlugin( pluginVendor );
					let pluginDisplayed = await this.pluginsBrowserPage.pluginTitledShown(
						pluginTitle,
						pluginVendor
					);
					assert( pluginDisplayed, `The plugin titled ${ pluginTitle } was not displayed` );
				}
			);
		} );
	}
);
