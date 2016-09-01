import LoginPageIOS from '../pages/ios/login-page-ios.js';
import SiteDetailsPage from '../pages/ios/site-details-page-ios.js';
import PagesListPage from '../pages/ios/pages-list-ios.js';
import NavbarComponent from '../components/ios/navbar-component-ios.js';

import config from 'config';

export default class LoginFlowMobile {
	constructor( driver, account, { selfHostedURL = '' } = {} ) {
		this.driver = driver;

		if ( account ) {
			this.account = account;
		} else {
			this.account = 'defaultUser';
		}

		this.selfHostedURL = selfHostedURL;
	}

        /**
        * Gets the account configs from the local config file.
        *
        * If the local configuration doesn't exist, fall back to the environmental variable.
        *
        * @param {string} account The account entry to get
	* @returns {array} Username/Password pair
        */
	static getAccountConfig( account ) {
		let localConfig;

		if ( config.has( 'testAccounts' ) ) {
			localConfig = config.get( 'testAccounts' );
		} else {
			localConfig = JSON.parse( process.env.ACCOUNT_INFO );
		}

		return localConfig[ account ];
	}

	login() {
		let testUserName, testPassword;
		const accountInfo = LoginFlowMobile.getAccountConfig( this.account );

		if ( accountInfo !== undefined ) {
			testUserName = accountInfo[0];
			testPassword = accountInfo[1];
		} else {
			throw new Error( `Account key '${this.account}' not found in environment variable ACCOUNT_INFO` );
		}

		let loginPage = new LoginPageIOS( this.driver );

		if ( this.selfHostedURL !== '' ) {
			loginPage.addSelfHostedURL( this.selfHostedURL );
		}

		return loginPage.login( testUserName, testPassword );
	}

	loginAndStartNewPost() {
		this.login();

		let navbarComponent = new NavbarComponent( this.driver );
		navbarComponent.openTab( 'New Post' );
	}

	loginAndStartNewPage() {
		this.login();

		let navbarComponent = new NavbarComponent( this.driver );
		navbarComponent.openTab( 'My Sites' );
		let siteDetailsPage = new SiteDetailsPage( this.driver );
		siteDetailsPage.clickMenuItem( 'Pages' );
		let pagesListPage = new PagesListPage( this.driver );
		pagesListPage.newPage();
	}
}
