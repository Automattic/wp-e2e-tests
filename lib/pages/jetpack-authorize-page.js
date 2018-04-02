/** @format */

import { By as by } from 'selenium-webdriver';
import BaseContainer from '../base-container';

import * as driverHelper from '../driver-helper';

export default class JetpackAuthorizePage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.is-section-jetpack-connect' ) );
		driver.getCurrentUrl().then( urlDisplayed => {
			this.setABTestControlGroupsInLocalStorage( urlDisplayed );
		} );
	}

	chooseSignIn() {
		return driverHelper.clickWhenClickable( this.driver, by.css( '.logged-out-form__link-item' ) );
	}

	approveConnection() {
		const authorizeButtonSelector = by.css( '.jetpack-connect__authorize-form button' );
		const authorizingSelector = by.css( '.jetpack-connect__logged-in-form-loading' );
		return driverHelper
			.clickWhenClickable( this.driver, authorizeButtonSelector )
			.then( () =>
				driverHelper.waitTillNotPresent( this.driver, authorizingSelector, this.explicitWaitMS * 2 )
			);
	}

	approveSSOConnection() {
		const SSOAprroveSelector = by.css( '.jetpack-connect__sso-actions button' );
		const loadingSelector = by.css( '.site.is-loading' );
		return driverHelper
			.waitTillNotPresent( this.driver, loadingSelector )
			.then( () => driverHelper.clickWhenClickable( this.driver, SSOAprroveSelector ) );
	}

	waitToDisappear() {
		return driverHelper.waitTillNotPresent(
			this.driver,
			this.expectedElementSelector,
			this.explicitWaitMS * 2
		);
	}
}
