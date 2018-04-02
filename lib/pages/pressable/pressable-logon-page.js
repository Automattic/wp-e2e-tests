/** @format */

import { By } from 'selenium-webdriver';
import config from 'config';
import BaseContainer from '../../base-container';
import * as driverHelper from '../../driver-helper';

export default class PressableLogonPage extends BaseContainer {
	constructor( driver, visit = false ) {
		const url = 'https://my.pressable.com/login';
		super( driver, By.css( 'form#new_user' ), visit, url );
	}

	logon() {
		const username = config.get( 'pressableUsername' );
		const password = config.get( 'pressablePassword' );
		driverHelper.setWhenSettable( this.driver, By.css( '#user_email' ), username );
		driverHelper.setWhenSettable( this.driver, By.css( '#user_password' ), password, {
			secureValue: true,
		} );
		return driverHelper.clickWhenClickable( this.driver, By.css( 'input[name="commit"]' ) );
	}

	loginWithWP() {
		const wpButtonSelector = By.css( 'div .btn-wordpress' );
		return driverHelper.clickWhenClickable( this.driver, wpButtonSelector );
	}
}
