import { By as by } from 'selenium-webdriver';
import BaseContainer from '../base-container';
import * as slackNotifier from '../slack-notifier';

import * as driverHelper from '../driver-helper';

export default class JetpackAuthorizePage extends BaseContainer {
	constructor( driver ) {
		driver.getCurrentUrl().then( ( url ) => {
			if ( url.indexOf( 'jetpack.wordpress.com' ) > -1 ) {
				const newUrl = url + '&jetpack_connect_test=calypso'; // force calypso sign up flow (A/B test)
				slackNotifier.warn( 'The Jetpack connect sign up page is still displaying the non-calypso version' );
				driver.get( newUrl );
			}
		} );
		super( driver, by.css( '.jetpack-connect__main' ) );
	}

	chooseSignIn() {
		return driverHelper.clickWhenClickable( this.driver, by.css( '.logged-out-form__link-item' ) );
	}

	approveConnection() {
		return driverHelper.clickWhenClickable( this.driver, by.css( '.jetpack-connect__authorize-form button' ) );
	}
}
