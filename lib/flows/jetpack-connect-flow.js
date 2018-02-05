import { By } from 'selenium-webdriver';

import LoginFlow from './login-flow';
import SidebarComponent from '../components/sidebar-component';

import AddNewSitePage from '../pages/add-new-site-page';
import PickAPlanPage from '../pages/signup/pick-a-plan-page';
import WporgCreatorPage from '../pages/wporg-creator-page';

import * as driverHelper from '../driver-helper';

export default class JetpackConnectFlow {
	constructor( driver, account ) {
		this.driver = driver;
		this.account = account;
	}

	connect() {
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
					console.log( `Route ${ url } does not include site slug ${ siteSlug }` );
				}
			} );
		} );
	}

	removeSites() {
		const loginFlow = new LoginFlow( this.driver, 'jetpackConnectUser' );
		loginFlow.loginAndSelectMySite();

		this.sidebarComponent = new SidebarComponent( this.driver );

		const removeSites = () => {
			this.sidebarComponent.removeBrokenSite().then( removed => {
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
				removeSites();
			} );
		};

		return removeSites();
	}
}
