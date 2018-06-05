/** @format */

import test from 'selenium-webdriver/testing';
import config from 'config';

import PressableLogonPage from '../lib/pages/pressable/pressable-logon-page';
import PressableSitesPage from '../lib/pages/pressable/pressable-sites-page';
import PressableApprovePage from '../lib/pages/pressable/pressable-approve-page';
import PressableSiteSettingsPage from '../lib/pages/pressable/pressable-site-settings-page';
import JetpackAuthorizePage from '../lib/pages/jetpack-authorize-page';
import * as driverManager from '../lib/driver-manager';
import * as dataHelper from '../lib/data-helper';
import PressableNUXFlow from '../lib/flows/pressable-nux-flow';
import ReaderPage from '../lib/pages/reader-page';
import SidebarComponent from '../lib/components/sidebar-component';
import StatsPage from '../lib/pages/stats-page';
import NavbarComponent from '../lib/components/navbar-component';
import JetpackConnectFlow from '../lib/flows/jetpack-connect-flow';
import LoginFlow from '../lib/flows/login-flow';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;

if ( host === 'PRESSABLE' ) {
	test.before( async function() {
		this.timeout( startBrowserTimeoutMS );
		driver = await driverManager.startBrowser();
	} );

	test.describe( `[${ host }] Pressable NUX: (${ screenSize })`, function() {
		this.timeout( mochaTimeOut * 2 );

		test.describe( 'Disconnect expired sites: @parallel @jetpack', function() {
			this.bailSuite( true );

			test.before( async function() {
				return await driverManager.ensureNotLoggedIn( driver );
			} );

			test.it( 'Can disconnect any expired sites', async function() {
				return await new JetpackConnectFlow( driver ).removeSites();
			} );
		} );

		test.describe( 'Connect via Pressable @parallel @jetpack', function() {
			this.bailSuite( true );

			test.before( async function() {
				return await driverManager.ensureNotLoggedIn( driver );
			} );

			test.it( 'Can log into WordPress.com', async function() {
				return await new LoginFlow( driver, 'jetpackUser' + host ).login();
			} );

			test.it( 'Can log into Pressable', async function() {
				return await new PressableLogonPage( driver, true ).loginWithWP();
			} );

			test.it( 'Can approve login with WordPress', async function() {
				return await new PressableApprovePage( driver ).approve();
			} );

			test.it( 'Can create new site', async function() {
				this.siteName = dataHelper.getNewBlogName();
				this.pressableSitesPage = new PressableSitesPage( driver );
				return await this.pressableSitesPage.addNewSite( this.siteName );
			} );

			test.it( 'Can go to site settings', async function() {
				return await this.pressableSitesPage.gotoSettings( this.siteName );
			} );

			test.it( 'Can proceed to Jetpack activation', async function() {
				const siteSettings = new PressableSiteSettingsPage( driver );
				await siteSettings.waitForJetpackPremium();
				return await siteSettings.activateJetpackPremium();
			} );

			test.it( 'Can approve connection on the authorization page', async function() {
				return await new JetpackAuthorizePage( driver, {
					overrideABTests: false,
				} ).approveConnection();
			} );

			test.it(
				'Can wait for 30 sec until Jetpack Rewind will be ready for configuration',
				function() {
					return driver.sleep( 30000 );
				}
			);

			test.it( 'Can proceed with Pressable NUX flow', async function() {
				return await new PressableNUXFlow( driver ).addSiteCredentials();
			} );

			test.it( 'Can open Rewind activity page', async function() {
				await new ReaderPage( driver, true ).displayed();
				await new NavbarComponent( driver ).clickMySites();
				const sidebarComponent = new SidebarComponent( driver );
				await sidebarComponent.selectSiteSwitcher();
				await sidebarComponent.searchForSite( this.siteName );
				await sidebarComponent.selectStats();
				return await new StatsPage( driver ).openActivity();
			} );

			// Disabled due to to longer time is required to make a backup.
			// test.it( 'Can wait until Rewind backup is completed', function() {
			// 	const activityPage = new ActivityPage( driver );
			// 	return activityPage.waitUntilBackupCompleted();
			// } );

			test.after( async function() {
				return await new PressableSitesPage( driver, true ).deleteFirstSite();
			} );
		} );
	} );
}
