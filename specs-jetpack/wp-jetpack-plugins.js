import assert from 'assert';
import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager.js';

import WPAdminLogonPage from '../lib/pages/wp-admin/wp-admin-logon-page';
import WPAdminSidebar from '../lib/pages/wp-admin/wp-admin-sidebar';
import WPAdminPluginsPage from '../lib/pages/wp-admin/wp-admin-plugins-page';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );

var driver;

test.before( 'Start Browser', function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( 'Jetpack Plugin', function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.it( 'can see Jetpack installed and capture version', function() {
		const wpAdminLogonPage = new WPAdminLogonPage( driver, true );
		wpAdminLogonPage.logonAsJetpackAdmin();
		const wpAdminSidebar = new WPAdminSidebar( driver );
		wpAdminSidebar.selectPlugins();
		const pluginsPage = new WPAdminPluginsPage( driver );
		pluginsPage.JetpackVersionInstalled().then( ( jpVersion ) => {
			assert.equal( jpVersion, 'Version Beta (Build 1736030)' );
		} );
	} );
} );
