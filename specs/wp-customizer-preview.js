import test from 'selenium-webdriver/testing';

import config from 'config';
import * as driverManager from '../lib/driver-manager.js';
import * as dataHelper from '../lib/data-helper';
import CustomizerPage from '../lib/pages/customizer-page.js';
import SidebarComponent from '../lib/components/sidebar-component';
import LoginFlow from '../lib/flows/login-flow.js';

const mochaTimeOut = config.get( 'mochaTimeoutMS' );
const startBrowserTimeoutMS = config.get( 'startBrowserTimeoutMS' );
const screenSize = driverManager.currentScreenSize();
const host = dataHelper.getJetpackHost();

let driver;

test.before( function() {
	this.timeout( startBrowserTimeoutMS );
	driver = driverManager.startBrowser();
} );

test.describe( `[${host}] Customizer: Preview (${screenSize})`, function() {
	this.bailSuite( true );

	test.describe( 'Preview a draft with changes in the menu @parallel', function() {
		this.timeout( mochaTimeOut );
		const newMenuName = dataHelper.getMenuName();

		test.it( 'Can log in and select my sites', function() {
			this.loginFlow = new LoginFlow( driver, 'defaultUser' );
			this.loginFlow.loginAndSelectMySite();
		} );

		test.it( 'Can go to customize themes', function() {
			this.sidebarComponent = new SidebarComponent( driver );
			this.sidebarComponent.customizeTheme();
			this.customizerPage = new CustomizerPage( driver );
		} );

		test.describe( 'Can create a new menu', function() {
			test.it( 'Can expand \"Menus\" menu', function() {
				return this.customizerPage.expandMenus();
			} );

			test.it( 'Can create a new menu as a primary menu', function() {
				return this.customizerPage.addNewMenuAndSetAsPrimary( newMenuName );
			} );
		} );

		const menuItemName1 = dataHelper.randomPhrase();
		const menuItemName2 = dataHelper.randomPhrase();

		test.describe( 'Can add items to the menu', function() {
			test.it( 'Can open the newly created menu', function() {
				return this.customizerPage.openMenuSettingsByMenuName( newMenuName );
			} );

			test.it( 'Can open "Add items" slider', function() {
				return this.customizerPage.openAddItemsSlider();
			} );

			test.it( 'Can add 2 new pages to the menu', function() {
				return this.customizerPage.addMenuItems( menuItemName1, menuItemName2 );
			} );

			test.it( 'Can open publish settings', function() {
				return this.customizerPage.openPublishSettings();
			} );

			test.it( 'Can select "Save Draft" action in publish settings', function() {
				return this.customizerPage.selectActionSaveDraft();
			} );

			test.it( 'Can save the theme', function() {
				return this.customizerPage.saveNewTheme();
			} );

			test.it( 'Can navigate to preview URL', function() {
				return this.customizerPage.navigateToPreviewURL();
			} );

			test.it( 'Can see the recently added menu items on the preview page', function() {
				return this.customizerPage.checkNavMenu( menuItemName1, menuItemName2 );
			} );
		} );
	} );
} );
