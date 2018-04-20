/** @format */

import { By } from 'selenium-webdriver';

import LoginFlow from './login-flow';
import SidebarComponent from '../components/sidebar-component';

import AddNewSitePage from '../pages/add-new-site-page';
import PickAPlanPage from '../pages/signup/pick-a-plan-page';
import WporgCreatorPage from '../pages/wporg-creator-page';
import JetpackAuthorizePage from '../pages/jetpack-authorize-page';
import WPAdminJetpackPage from '../pages/wp-admin/wp-admin-jetpack-page.js';
import WPAdminSidebar from '../pages/wp-admin/wp-admin-sidebar.js';

import * as driverManager from '../driver-manager';
import * as driverHelper from '../driver-helper';

export default class JetpackConnectFlow {
	constructor( driver, account, template ) {
		this.driver = driver;
		this.account = account;
		this.template = template;
	}

	createJNSite() {
		const wporgCreator = new WporgCreatorPage( this.driver, this.template );
		wporgCreator.waitForWpadmin();
		wporgCreator.getUrl().then( url => ( this.url = url ) );
		wporgCreator.getPassword().then( password => ( this.password = password ) );
		return wporgCreator.getUsername().then( username => ( this.username = username ) );
	}

	connectFromCalypso() {
		driverManager.ensureNotLoggedIn( this.driver );
		return this.createJNSite()
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
					if ( ! url.includes( siteSlug ) ) {
						console.debug( `Route ${ url } does not include site slug ${ siteSlug }` );
					}
				} );
			} );
	}

	connectFromWPAdmin() {
		driverManager.ensureNotLoggedIn( this.driver );
		this.createJNSite();
		new WPAdminSidebar( this.driver ).selectJetpack();
		const wpAdminJetpack = new WPAdminJetpackPage( this.driver );
		wpAdminJetpack.connectWordPressCom();
		new LoginFlow( this.driver, this.account ).loginUsingExistingForm();
		new JetpackAuthorizePage( this.driver ).approveConnection();
		new PickAPlanPage( this.driver ).selectFreePlanJetpack();
		wpAdminJetpack.jumpstartDisplayed();
		wpAdminJetpack.activateRecommendedFeatures();
	}

	removeSites() {
		const loginFlow = new LoginFlow( this.driver, this.account );
		loginFlow.loginAndSelectMySite();

		this.sidebarComponent = new SidebarComponent( this.driver );

		const removeSites = () => {
			return this.sidebarComponent.removeBrokenSite().then( removed => {
				if ( ! removed ) {
					// no sites left to remove
					return;
				}
				// seems like it is not waiting for this
				driverHelper.waitTillPresentAndDisplayed(
					this.driver,
					By.css( '.notice.is-success.is-dismissable' )
				);
				driverHelper.clickWhenClickable(
					this.driver,
					By.css( '.notice.is-dismissable .notice__dismiss' )
				);
				return removeSites();
			} );
		};

		return removeSites();
	}
}
