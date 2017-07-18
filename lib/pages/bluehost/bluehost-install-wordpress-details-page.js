import { By as by } from 'selenium-webdriver';
import config from 'config';
import BaseContainer from '../../base-container';
import * as driverHelper from '../../driver-helper';

export default class BluehostInstallWordPressDetailsPage extends BaseContainer {
	constructor( driver, visit = false ) {
		const url = config.get( 'bluehostInstallWordPressUrl' );
		super( driver, by.css( 'form.mm-inputs input[name="ss_site_title"]' ), visit, url );
	}

	submitAdminDetails() {
		const siteTitle = config.get( 'bluehostWPInstallSiteTitle' );
		const username = config.get( 'bluehostWPInstallUsername' );
		const email = config.get( 'bluehostWPInstallEmail' );
		const password = config.get( 'bluehostWPInstallPassword' );

		driverHelper.setWhenSettable( this.driver, by.css( 'input[name="ss_site_title"]' ), siteTitle );
		driverHelper.setWhenSettable( this.driver, by.css( 'input[name="ss_admin_user"]' ), username );
		driverHelper.setWhenSettable( this.driver, by.css( 'input[name="ss_admin_email"]' ), email );
		driverHelper.setWhenSettable( this.driver, by.css( 'input[name="ss_admin_pass"]' ), password, { secureValue: true } );
		return driverHelper.clickWhenClickable( this.driver, by.css( 'button[type="submit"].mm-btn' ) );
	}
}
