import LoginFlow from './login-flow';
import SidebarComponent from '../components/sidebar-component';

import AddNewSitePage from '../pages/add-new-site-page';
import PickAPlanPage from '../pages/signup/pick-a-plan-page';
import WporgCreatorPage from '../pages/wporg-creator-page';
import JetpackAuthorizePage from '../pages/jetpack-authorize-page';
import WPAdminJetpackPage from '../pages/wp-admin/wp-admin-jetpack-page.js';
import WPAdminSidebar from '../pages/wp-admin/wp-admin-sidebar.js';

import * as driverManager from '../driver-manager';

const debug = require( 'debug' )( 'e2e-tests' );

export default class JetpackConnectFlow {
	constructor( driver, account ) {
		this.driver = driver;
		this.account = account;
	}

	connect() {
		driverManager.ensureNotLoggedIn( this.driver );
		this.wporgCreator = new WporgCreatorPage( this.driver, 'test' );
		return this.wporgCreator.waitForWpadmin()
		.then( () => {
			return this.wporgCreator.getUrl().then( url => {
				this.url = url;
			} );
		} )
		.then( () => {
			return this.wporgCreator.getPassword().then( password => {
				this.password = password;
			} );
		} )
		.then( () => {
			const loginFlow = new LoginFlow( this.driver, this.account );
			loginFlow.loginAndSelectMySite();
		} )
		.then( () => {
			const sidebarComponent = new SidebarComponent( this.driver );
			sidebarComponent.addNewSite( this.driver );
			const addNewSitePage = new AddNewSitePage( this.driver );
			return addNewSitePage.addSiteUrl( this.url );
		} )
		.then( () => {
			this.pickAPlanPage = new PickAPlanPage( this.driver );
			return this.pickAPlanPage.selectFreePlanJetpack();
		} )
		.then( () => {
			const siteSlug = this.url.replace( /^https?:\/\//, '' );
			return this.driver.getCurrentUrl().then( url => {
				if ( !url.includes( siteSlug ) ) {
					console.debug( `Route ${ url } does not include site slug ${ siteSlug }` );
				}
			} );
		} );
	}

	connect2() {
		driverManager.ensureNotLoggedIn( this.driver );
		this.wporgCreator = new WporgCreatorPage( this.driver, 'test' );
		return this.wporgCreator.waitForWpadmin()
		.then( () => {
			return this.wporgCreator.getUrl().then( url => {
				this.url = url.replace( /^https?:\/\//, '' );
			} );
		} )
		.then( () => {
			return this.wporgCreator.getPassword().then( password => {
				this.password = password;
			} );
		} )
		.then( () => {
			debug( 'Can navigate to the Jetpack dashboard' );
			this.wpAdminSidebar = new WPAdminSidebar( this.driver );
			return this.wpAdminSidebar.selectJetpack();
		} )
		.then( () => {
			debug( 'Can click the Connect Jetpack button' );
			this.wpAdminJetpack = new WPAdminJetpackPage( this.driver );
			return this.wpAdminJetpack.connectWordPressCom();
		} )
		.then( () => {
			debug( 'Can login into WordPress.com' );
			const loginFlow = new LoginFlow( this.driver, this.account );
			return loginFlow.loginUsingExistingForm();
		} )
		.then( () => {
			debug( 'Can approve connection on the authorization page' );
			this.jetpackAuthorizePage = new JetpackAuthorizePage( this.driver );
			return this.jetpackAuthorizePage.approveConnection();
		} )
		.then( () => {
			debug( 'Can click the free plan button' );
			this.pickAPlanPage = new PickAPlanPage( this.driver );
			return this.pickAPlanPage.selectFreePlanJetpack();
		} )
		.then( () => {
			debug( 'Is redirected back to the Jetpack dashboard with Jumpstart displayed' );
			return this.wpAdminJetpack.jumpstartDisplayed();
		} )
		.then( () => {
			debug( 'Can activate Jetpack recommended features' );
			return this.wpAdminJetpack.activateRecommendedFeatures();
		} );
	}

	removeSites() {
		const loginFlow = new LoginFlow( this.driver, this.account );
		loginFlow.loginAndSelectMySite();

		const sidebarComponent = new SidebarComponent( this.driver );
		return sidebarComponent.removeAllBrokenSites();
	}
}
