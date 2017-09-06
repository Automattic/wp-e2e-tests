import { By as by } from 'selenium-webdriver';
import config from 'config';
import BaseContainer from '../../base-container';
import * as driverHelper from '../../driver-helper';

export default class BluehostLoginPage extends BaseContainer {
	constructor( driver, visit = true ) {
		const url = config.get( 'bluehostLoginUrl' );
		super( driver, by.css( 'form.login_form' ), visit, url );
	}

	logon() {
		const username = config.get( 'bluehostUsername' );
		const password = config.get( 'bluehostPassword' );
		driverHelper.setWhenSettable( this.driver, by.css( '#ldomain' ), username );
		driverHelper.setWhenSettable( this.driver, by.css( '#lpass' ), password, { secureValue: true } );
		return driverHelper.clickWhenClickable( this.driver, by.css( 'button[type="submit"].btn_secondary' ) );
	}
}
