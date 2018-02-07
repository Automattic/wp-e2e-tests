import test from 'selenium-webdriver/testing';
import config from 'config';

const fs = require( 'fs' );
const debug = require( 'debug' )( 'e2e-tests' );

import JetpackConnectFlow from '../../lib/flows/jetpack-connect-flow.js';

import * as driverManager from '../../lib/driver-manager';
import * as dataHelper from '../../lib/data-helper';
import WPAdminDashboardPage from '../../lib/pages/wp-admin/wp-admin-dashboard-page';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `[${host}] Jetpack Connection: (${screenSize}) @jetpack`, function() {
	this.timeout( mochaTimeOut );
	this.bailSuite( true );

	test.before( function() {
		return driverManager.clearCookiesAndDeleteLocalStorage( driver );
	} );

	test.it( 'Can log into WordPress.com', () => {
		if ( host === 'JN' ) {
			debug( 'starting host: %s', host );

			const jnFlow = new JetpackConnectFlow( driver, 'jetpackUserJN' );
			// jnFlow.removeSites().then( () => {
			// 	return jnFlow.connect2();
			// } ).then( () => {
			return jnFlow.connect2().then( () => {
				const wpDashboard = new WPAdminDashboardPage( driver, jnFlow.url );
				return wpDashboard.logout();
			} ).then( () => {
				// Write url and site credentials into file for further use
				const fileContents = `${jnFlow.url} demo ${jnFlow.password}`;
				return fs.mkdir( './temp', err => {
					if ( err && err.code !== 'EEXIST' ) {
						return console.log( err );
					}

					fs.writeFile( './temp/jn-credentials.txt',
						fileContents,
						fileErr => {
							if ( fileErr ) {
								return console.log( fileErr );
							}
							console.log( 'The file was saved!' );
						} );
				} );
			} );
		}
		return false;
	} );
} );
