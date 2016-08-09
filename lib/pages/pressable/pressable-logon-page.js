import { By as by } from 'selenium-webdriver';
import config from 'config';
import BaseContainer from '../../base-container';
import * as driverHelper from '../../driver-helper';

export default class PressableLogonPage extends BaseContainer {
	constructor( driver, visit = false ) {
		const url = config.get( 'pressableLoginUrl' );
		super( driver, by.css( 'form#new_user' ), visit, url );
	}

	logon() {
		const username = config.get( 'pressableUsername' );
		const password = config.get( 'pressablePassword' );
		driverHelper.setWhenSettable( this.driver, by.css( '#user_email' ), username );
		driverHelper.setWhenSettable( this.driver, by.css( '#user_password' ), password, { secureValue: true } );
		return driverHelper.clickWhenClickable( this.driver, by.css( 'input[name="commit"]' ) );
	}
}
