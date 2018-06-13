/** @format */

import LoginPage from '../pages/login-page.js';
import EditorPage from '../pages/editor-page';
import WPAdminLoginPage from '../pages/wp-admin/wp-admin-logon-page';
import ReaderPage from '../pages/reader-page.js';
import StatsPage from '../pages/stats-page.js';
import StoreDashboardPage from '../pages/woocommerce/store-dashboard-page';

import SidebarComponent from '../components/sidebar-component.js';
import NavBarComponent from '../components/nav-bar-component.js';

import * as eyesHelper from '../eyes-helper';
import * as dataHelper from '../data-helper';
import * as driverHelper from '../driver-helper';
const host = dataHelper.getJetpackHost();

export default class LoginFlow {
	constructor( driver, accountOrFeatures ) {
		this.driver = driver;
		if ( host !== 'WPCOM' && ! accountOrFeatures ) {
			accountOrFeatures = 'jetpackUser' + host;
		}
		accountOrFeatures = accountOrFeatures || 'defaultUser';
		if ( typeof accountOrFeatures === 'string' ) {
			const legacyConfig = dataHelper.getAccountConfig( accountOrFeatures );
			if ( ! legacyConfig ) {
				throw new Error( `Account key '${ accountOrFeatures }' not found in the configuration` );
			}

			this.account = {
				email: legacyConfig[ 0 ],
				username: legacyConfig[ 0 ],
				password: legacyConfig[ 1 ],
				loginURL: legacyConfig[ 2 ],
				legacyAccountName: accountOrFeatures,
			};
		} else {
			this.account = dataHelper.pickRandomAccountWithFeatures( accountOrFeatures );
			if ( ! this.account ) {
				throw new Error(
					`Could not find any account matching features '${ accountOrFeatures.toString() }'`
				);
			}
		}

		if ( this.account.legacyAccountName === 'jetpackConnectUser' ) {
			driverHelper.refreshIfJNError( driver );
		}
	}

	async login( { jetpackSSO = false, jetpackDIRECT = false, screenshot = false } = {}, eyes ) {
		let loginURL = this.account.loginURL,
			loginPage;

		if (
			( host === 'CI' || host === 'JN' ) &&
			this.account.legacyAccountName !== 'jetpackConnectUser'
		) {
			loginURL = `http://${ dataHelper.getJetpackSiteName() }/wp-admin`;
		}

		if ( jetpackSSO || jetpackDIRECT ) {
			loginPage = await WPAdminLoginPage.Visit( this.driver, loginURL );

			if ( jetpackSSO ) {
				return await loginPage.logonSSO();
			}
		} else {
			loginPage = await LoginPage.Visit( this.driver );
		}

		if ( screenshot ) {
			await eyesHelper.eyesScreenshot( this.driver, eyes, 'Login Page' );
		}

		return await loginPage.login(
			this.account.email || this.account.username,
			this.account.password
		);
	}

	async loginAndStartNewPost( siteURL = null ) {
		if (
			siteURL ||
			( host !== 'WPCOM' && this.account.legacyAccountName !== 'jetpackConnectUser' )
		) {
			siteURL = siteURL || dataHelper.getJetpackSiteName();
		}

		await this.login();

		const readerPage = await ReaderPage.Visit( this.driver );
		await readerPage.waitForPage();

		const navbarComponent = await NavBarComponent.Expect( this.driver );
		await navbarComponent.clickCreateNewPost( { siteURL: siteURL } );

		this.editorPage = await EditorPage.Expect( this.driver );

		let urlDisplayed = await this.driver.getCurrentUrl();
		return await this.editorPage.setABTestControlGroupsInLocalStorage( urlDisplayed );
	}

	async loginAndStartNewPage( site = null ) {
		await this.loginAndSelectMySite( site );

		let sidebarComponent = new SidebarComponent( this.driver );
		await sidebarComponent.selectAddNewPage();

		this.editorPage = await EditorPage.Expect( this.driver );

		let urlDisplayed = await this.driver.getCurrentUrl();
		return await this.editorPage.setABTestControlGroupsInLocalStorage( urlDisplayed );
	}

	async loginAndSelectDomains() {
		await this.loginAndSelectMySite();

		let sideBarComponent = new SidebarComponent( this.driver );
		return await sideBarComponent.selectDomains();
	}

	async loginAndSelectPeople() {
		await this.loginAndSelectMySite();

		let sideBarComponent = new SidebarComponent( this.driver );
		return await sideBarComponent.selectPeople();
	}

	async loginAndSelectAddPersonFromSidebar() {
		await this.loginAndSelectMySite();

		let sideBarComponent = new SidebarComponent( this.driver );
		return await sideBarComponent.selectAddPerson();
	}

	async loginAndSelectMySite( site = null ) {
		await this.login();

		const readerPage = await ReaderPage.Visit( this.driver );
		await readerPage.waitForPage();

		const navbarComponent = await NavBarComponent.Expect( this.driver );
		await navbarComponent.clickMySites();

		if (
			site ||
			( ( host === 'CI' || host === 'JN' ) &&
				this.account.legacyAccountName !== 'jetpackConnectUser' )
		) {
			const siteURL = site || dataHelper.getJetpackSiteName();

			let sideBarComponent = new SidebarComponent( this.driver );
			await sideBarComponent.selectSiteSwitcher();
			await sideBarComponent.searchForSite( siteURL );
		}

		return await StatsPage.Expect( this.driver );
	}

	async loginAndSelectAllSites() {
		await this.loginAndSelectMySite();

		const sideBarComponent = new SidebarComponent( this.driver );
		await sideBarComponent.selectSiteSwitcher();
		return await sideBarComponent.selectAllSites();
	}

	async loginAndSelectThemes() {
		await this.loginAndSelectMySite();
		let sideBarComponent = new SidebarComponent( this.driver );

		if (
			( host === 'CI' || host === 'JN' ) &&
			this.account.legacyAccountName !== 'jetpackConnectUser'
		) {
			const siteURL = dataHelper.getJetpackSiteName();

			await sideBarComponent.selectSiteSwitcher();
			await sideBarComponent.searchForSite( siteURL );
		}

		return await sideBarComponent.selectThemes();
	}

	async loginAndSelectManagePlugins() {
		await this.loginAndSelectMySite();

		let sideBarComponent = new SidebarComponent( this.driver );
		return await sideBarComponent.selectManagePlugins();
	}

	async loginAndSelectPlugins() {
		await this.loginAndSelectMySite();

		let sideBarComponent = new SidebarComponent( this.driver );
		return await sideBarComponent.selectPlugins();
	}

	async loginAndSelectSettings() {
		await this.loginAndSelectMySite();

		let sideBarComponent = new SidebarComponent( this.driver );
		return await sideBarComponent.selectSettings();
	}

	async loginUsingExistingForm() {
		let loginPage = await LoginPage.Expect( this.driver );
		return await loginPage.login(
			this.account.email || this.account.username,
			this.account.password
		);
	}

	async loginAndOpenWooStore() {
		await this.loginAndSelectMySite();
		this.sideBarComponent = new SidebarComponent( this.driver );
		await this.sideBarComponent.selectStoreOption();
		return new StoreDashboardPage( this.driver );
	}

	end() {
		if ( typeof this.account !== 'string' ) {
			dataHelper.releaseAccount( this.account );
		}
	}
}
