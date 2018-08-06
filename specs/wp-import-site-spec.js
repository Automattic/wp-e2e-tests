/** @format */

import config from 'config';
import assert from 'assert';

import LoginFlow from '../lib/flows/login-flow.js';

import NavBarComponent from '../lib/components/nav-bar-component.js';
import SideBarComponent from '../lib/components/sidebar-component';

import ImporterPage from '../lib/pages/settings/importer-page';

import * as driverManager from '../lib/driver-manager.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();

let driver;

before( async function() {
	this.timeout( startBrowserTimeoutMS );
	driver = await driverManager.startBrowser();
} );

describe( 'Verify Import Option: (' + screenSize + ') @parallel', function() {
	this.timeout( mochaTimeOut );

	step( 'Ensure not logged in', async function() {
		await driverManager.ensureNotLoggedIn( driver );
	} );

	step( 'Can log in as default user', async function() {
		const loginFlow = new LoginFlow( driver );
		return await loginFlow.login();
	} );

	step( 'Can open the sidebar', async function() {
		const navBarComponent = await NavBarComponent.Expect( driver );
		await navBarComponent.clickMySites();
	} );

	step( "Can see an 'Import' option", async function() {
		const sideBarComponent = await SideBarComponent.Expect( driver );
		return assert(
			await sideBarComponent.settingsOptionExists(),
			'The settings menu option does not exist'
		);
	} );

	step( "Following 'Import' menu option opens the Import page", async function() {
		const sideBarComponent = await SideBarComponent.Expect( driver );
		await sideBarComponent.selectImport();
		await ImporterPage.Expect( driver );
	} );

	step( 'Can see the WordPress importer', async function() {
		const importerPage = await ImporterPage.Expect( driver );
		assert( await importerPage.importerIsDisplayed( 'wordpress' ) );
	} );

	step( 'Can see the Medium importer', async function() {
		const importerPage = await ImporterPage.Expect( driver );
		assert( await importerPage.importerIsDisplayed( 'medium' ) );
	} );

	step( 'Can see the Blogger importer', async function() {
		const importerPage = await ImporterPage.Expect( driver );
		assert( await importerPage.importerIsDisplayed( 'blogger-alt' ) );
	} );
} );
