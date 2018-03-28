import { By as by } from 'selenium-webdriver';
import BaseContainer from '../base-container';

import * as driverHelper from '../driver-helper';

export default class JetpackAuthorizePage extends BaseContainer {
	constructor( driver, { overrideABTests = true } = {} ) {
		super( driver, by.css( '.is-section-jetpack-connect' ) );
		if ( overrideABTests === true ) {
			driver.getCurrentUrl().then( ( urlDisplayed ) => {
				this.setABTestControlGroupsInLocalStorage( urlDisplayed );
			} );
		}
	}

	chooseSignIn() {
		return driverHelper.clickWhenClickable( this.driver, by.css( '.logged-out-form__link-item' ) );
	}

	approveConnection() {
		const authorizeButtonSelector = by.css( '.jetpack-connect__authorize-form button' );
		driverHelper.clickWhenClickable( this.driver, authorizeButtonSelector );
		return this.waitToDisappear();
	}

	approveSSOConnection() {
		const SSOAprroveSelector = by.css( '.jetpack-connect__sso-actions button' );
		const loadingSelector = by.css( '.site.is-loading' );
		return driverHelper.waitTillNotPresent( this.driver, loadingSelector )
		.then( () => driverHelper.clickWhenClickable( this.driver, SSOAprroveSelector ) );
	}

	waitToDisappear() {
		return driverHelper.waitTillNotPresent( this.driver, by.css( '.jetpack-connect__logged-in-form-loading' ), this.explicitWaitMS * 2 );
	}
}
