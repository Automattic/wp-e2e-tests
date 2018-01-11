import LoginPage from '../pages/login-page.js';
import EditorPage from '../pages/editor-page';
import WPAdminLoginPage from '../pages/wp-admin/wp-admin-logon-page';
import ReaderPage from '../pages/reader-page.js';
import StatsPage from '../pages/stats-page.js';
import StoreDashboardPage from '../pages/woocommerce/store-dashboard-page';

import SidebarComponent from '../components/sidebar-component.js';
import NavbarComponent from '../components/navbar-component.js';

import * as dataHelper from '../data-helper';
const host = dataHelper.getJetpackHost();

export default class LoginFlow {
	constructor( driver, accountOrFeatures ) {
		this.driver = driver;
		accountOrFeatures = accountOrFeatures || 'defaultUser';
		if ( typeof accountOrFeatures === 'string' ) {
			const legacyConfig = dataHelper.getAccountConfig( accountOrFeatures );
			if ( ! legacyConfig ) {
				throw new Error( `Account key '${ accountOrFeatures }' not found in the configuration` );
			}
			this.account = {
				email: legacyConfig[0],
				password: legacyConfig[1],
				loginURL: legacyConfig[2],
			};
		} else {
			this.account = dataHelper.getRandomAccountWithFeatures( accountOrFeatures );
			if ( ! this.account ) {
				throw new Error( `Could not find any account matching features '${ accountOrFeatures.toString() }'` );
			}
		}
	}

	login( { jetpackSSO = false, jetpackDIRECT = false } = {} ) {
		let loginURL = this.account.loginURL, loginPage;

		if ( host === 'CI' && this.account !== 'jetpackConnectUser' ) {
			loginURL = `http://${dataHelper.getJetpackSiteName()}/wp-admin`;
		}

		if ( jetpackSSO || jetpackDIRECT ) {
			loginPage = new WPAdminLoginPage( this.driver, loginURL, { visit: true } );

			if ( jetpackSSO ) {
				return loginPage.logonSSO();
			}
		} else {
			loginPage = new LoginPage( this.driver, true );
		}

		return loginPage.login( this.account.email || this.account.username, this.account.password );
	}

	loginAndStartNewPost() {
		let siteURL = null;
		if ( host === 'CI' && this.account !== 'jetpackConnectUser' ) {
			siteURL = dataHelper.getJetpackSiteName();
		}

		this.login();

		let readerPage = new ReaderPage( this.driver, true );
		readerPage.waitForPage();

		let navbarComponent = new NavbarComponent( this.driver );
		navbarComponent.clickCreateNewPost( { siteURL: siteURL } );

		this.editorPage = new EditorPage( this.driver );

		this.driver.getCurrentUrl().then( ( urlDisplayed ) => {
			return this.editorPage.setABTestControlGroupsInLocalStorage( urlDisplayed );
		} );
	}

	loginAndStartNewPage() {
		this.loginAndSelectMySite();

		let sidebarComponent = new SidebarComponent( this.driver );
		sidebarComponent.selectAddNewPage();

		this.editorPage = new EditorPage( this.driver );

		this.driver.getCurrentUrl().then( ( urlDisplayed ) => {
			return this.editorPage.setABTestControlGroupsInLocalStorage( urlDisplayed );
		} );
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

		if ( host === 'CI' && this.account !== 'jetpackConnectUser' ) {
			const siteURL = dataHelper.getJetpackSiteName();

			let sideBarComponent = new SidebarComponent( this.driver );
			sideBarComponent.selectSiteSwitcher();
			sideBarComponent.searchForSite( siteURL );
		}

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

		if ( host === 'CI' && this.account !== 'jetpackConnectUser' ) {
			const siteURL = dataHelper.getJetpackSiteName();

			sideBarComponent.selectSiteSwitcher();
			sideBarComponent.searchForSite( siteURL );
		}

		return sideBarComponent.selectThemes();
	}

	loginAndSelectManagePlugins() {
		this.loginAndSelectMySite();

		let sideBarComponent = new SidebarComponent( this.driver );
		return sideBarComponent.selectManagePlugins();
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

		const accountInfo = dataHelper.getAccountConfig( this.account );

		if ( accountInfo !== undefined ) {
			testUserName = accountInfo[0];
			testPassword = accountInfo[1];
		} else {
			throw new Error( `Account key '${this.account}' not found in the configuration` );
		}

		let loginPage = new LoginPage( this.driver, false );
		return loginPage.login( testUserName, testPassword );
	}

	loginAndOpenWooStore() {
		this.loginAndSelectMySite();
		this.sideBarComponent = new SidebarComponent( this.driver );
		this.sideBarComponent.selectStoreOption();
		return new StoreDashboardPage( this.driver );
	}

}
