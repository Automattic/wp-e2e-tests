/** @format */
import test from 'selenium-webdriver/testing';
import config from 'config';

import * as driverManager from '../lib/driver-manager';
import * as driverHelper from '../lib/driver-helper';
import { By } from 'selenium-webdriver';

import AddNewSitePage from '../lib/pages/add-new-site-page';
import JetpackAuthorizePage from '../lib/pages/jetpack-authorize-page';
import JetpackConnectInstallPage from '../lib/pages/jetpack-connect-install-page';
import PickAPlanPage from '../lib/pages/signup/pick-a-plan-page';
import WPAdminPluginsPage from '../lib/pages/wp-admin/wp-admin-plugins-page.js';
import WPAdminPluginPopup from '../lib/pages/wp-admin/wp-admin-plugin-popup';
import WPAdminUpdatesPage from '../lib/pages/wp-admin/wp-admin-updates-page';
import WporgCreatorPage from '../lib/pages/wporg-creator-page';
import WPAdminJetpackPage from '../lib/pages/wp-admin/wp-admin-jetpack-page.js';
import WPAdminSidebar from '../lib/pages/wp-admin/wp-admin-sidebar.js';
import LoginFlow from '../lib/flows/login-flow';
import SidebarComponent from '../lib/components/sidebar-component';

import JetpackConnectFlow from '../lib/flows/jetpack-connect-flow';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

var driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `Jetpack Connect: (${ screenSize })`, function() {
	this.timeout( mochaTimeOut );

	test.describe( 'Disconnect expired sites: @parallel @jetpack', function() {
		this.bailSuite( true );

		test.before( function() {
			return driverManager.clearCookiesAndDeleteLocalStorage( driver );
		} );

		test.it( 'Connect JN site', () => {
			this.jnFlow = new JetpackConnectFlow( driver, 'jetpackUserJN' );
			this.jnFlow.connect().then( () => {
				console.log( '====================================' );
				console.log( this.jnFlow.url );
				console.log( this.jnFlow.password );
				console.log( '====================================' );
			} );
		} );
	} );

	// test.describe( 'Connect From Calypso: @parallel @jetpack', function() {
	// 	this.bailSuite( true );

	// 	test.before( function() {
	// 		return driverManager.ensureNotLoggedIn( driver );
	// 	} );

	// 	test.it( 'Can create a WP.org site', () => {
	// 		this.jnFlow = new JetpackConnectFlow( this.driver );
	// 		this.jnFlow.connect();
	// 		console.log( '====================================' );
	// 		console.log( this.jnFlow.url );
	// 		console.log( this.jnFlow.password );
	// 		console.log( '====================================' );
	// 	} );
	// } );
} );
