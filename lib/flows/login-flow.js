import LoginPage from '../pages/login-page.js';
import ReaderPage from '../pages/reader-page.js';
import StatsPage from '../pages/stats-page.js';

import config from 'config';

import SidebarComponent from '../components/sidebar-component.js';
import NavbarComponent from '../components/navbar-component.js';

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
	*/
	static getAccountConfig( account ) {

		let localConfig;

		if ( config.has( 'testAccounts' ) ) {
			localConfig = config.get( 'testAccounts' );
		}
		else {
			localConfig = JSON.parse( process.env.ACCOUNT_INFO );
		}

		return localConfig[ account ];
	}

	login( queryString ) {
		let testUserName, testPassword;

		const accountInfo = LoginFlow.getAccountConfig( this.account );

		if ( accountInfo !== undefined ) {
			testUserName = accountInfo[0];
			testPassword = accountInfo[1];
		} else {
			throw new Error( `Account key '${this.account}' not found in the configuration` );
		}

		const loginPage = new LoginPage( this.driver, true, queryString );
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
