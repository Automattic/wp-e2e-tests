import LoginPage from '../pages/login-page.js';
import WPAdminLoginPage from '../pages/wp-admin/wp-admin-logon-page';
import ReaderPage from '../pages/reader-page.js';
import StatsPage from '../pages/stats-page.js';

import config from 'config';

import SidebarComponent from '../components/sidebar-component.js';
import NavbarComponent from '../components/navbar-component.js';

import * as dataHelper from '../data-helper';

export default class LoginFlow {
	constructor( driver, account ) {
		this.driver = driver;

		if ( account ) {
			this.account = account;
		} else {
			this.account = 'defaultUser';
		}
	}

	/**
	* Gets the account configs from the local config file.
	*
	* If the local configuration doesn't exist, fall back to the environmental variable.
	*
	* @param {string} account The account entry to get
	* @returns {object} account Username/Password pair
	*/
	static getAccountConfig( account ) {
		let localConfig;

		if ( config.has( 'testAccounts' ) ) {
			localConfig = config.get( 'testAccounts' );
		} else {
			localConfig = JSON.parse( process.env.ACCOUNT_INFO );
		}

		let host = dataHelper.getJetpackHost();
		if ( host !== 'WPCOM' ) {
			account = 'jetpackUser' + host;
		}

		return localConfig[ account ];
	}

	login( { jetpackSSO = false } = {} ) {
		let testUserName, testPassword, loginURL, loginPage;

		const accountInfo = LoginFlow.getAccountConfig( this.account );

		if ( accountInfo !== undefined ) {
			testUserName = accountInfo[0];
			testPassword = accountInfo[1];
			loginURL = accountInfo[2]; // Will only be populated for Jetpack sites
		} else {
			throw new Error( `Account key '${this.account}' not found in the configuration` );
		}

		if ( loginURL !== undefined && jetpackSSO ) {
			loginPage = new WPAdminLoginPage( this.driver, loginURL, { visit: true } );
			return loginPage.logonSSO();
		}

		loginPage = new LoginPage( this.driver, true );
		this.driver.getCurrentUrl().then( ( urlDisplayed ) => {
			return loginPage.setABTestControlGroupsInLocalStorage( urlDisplayed );
		} );
		return loginPage.login( testUserName, testPassword );
	}

	loginAndStartNewPost() {
		this.login();

		let readerPage = new ReaderPage( this.driver, true );
		readerPage.waitForPage();

		let navbarComponent = new NavbarComponent( this.driver );
		return navbarComponent.clickCreateNewPost();
	}

	loginAndStartNewPage() {
		this.loginAndSelectMySite();

		let sidebarComponent = new SidebarComponent( this.driver );
		return sidebarComponent.selectAddNewPage();
	}

	loginAndSelectDomains() {
		this.loginAndSelectMySite();

		let sideBarComponent = new SidebarComponent( this.driver );
		return sideBarComponent.selectDomains();
	}

	loginAndSelectPeople() {
		this.loginAndSelectMySite();

		let sideBarComponent = new SidebarComponent( this.driver );
		return sideBarComponent.selectPeople();
	}

	loginAndSelectAddPersonFromSidebar() {
		this.loginAndSelectMySite();

		let sideBarComponent = new SidebarComponent( this.driver );
		sideBarComponent.selectAddPerson();
	}

	loginAndSelectMySite() {
		this.login();

		let readerPage = new ReaderPage( this.driver, true );
		readerPage.waitForPage();

		let navbarComponent = new NavbarComponent( this.driver );
		navbarComponent.clickMySites();

		let statsPage = new StatsPage( this.driver );
		statsPage.waitForPage();
	}

	loginAndSelectAllSites() {
		this.loginAndSelectMySite();

		const sideBarComponent = new SidebarComponent( this.driver );
		sideBarComponent.selectSiteSwitcher();
		return sideBarComponent.selectAllSites();
	}

	loginAndSelectThemes() {
		this.loginAndSelectMySite();

		let sideBarComponent = new SidebarComponent( this.driver );
		return sideBarComponent.selectThemes();
	}

	loginAndSelectPlugins() {
		this.loginAndSelectMySite();

		let sideBarComponent = new SidebarComponent( this.driver );
		return sideBarComponent.selectPlugins();
	}

	loginAndSelectSettings() {
		this.loginAndSelectMySite();

		let sideBarComponent = new SidebarComponent( this.driver );
		return sideBarComponent.selectSettings();
	}

	loginUsingExistingForm() {
		let testUserName, testPassword;

		const accountInfo = LoginFlow.getAccountConfig( this.account );

		if ( accountInfo !== undefined ) {
			testUserName = accountInfo[0];
			testPassword = accountInfo[1];
		} else {
			throw new Error( `Account key '${this.account}' not found in the configuration` );
		}

		let loginPage = new LoginPage( this.driver, false );
		return loginPage.login( testUserName, testPassword );
	}
}
