import { By as by } from 'selenium-webdriver';
import config from 'config';
import BaseContainer from '../../base-container';
import * as driverHelper from '../../driver-helper';

export default class WPAdminHomePage extends BaseContainer {
	constructor( driver, visit = false, adminUrlOverride = false ) {
		const wpAdminURL = adminUrlOverride
			? adminUrlOverride
			: `https://${config.get( 'jetpacksite' )}/wp-admin`;
		super( driver, by.css( '#dashboard-widgets-wrap' ), visit, wpAdminURL );
	}

	isJetpackDashboardConnectWidgetShowing() {
		return driverHelper.waitTillPresentAndDisplayed( this.driver, by.css( '#jetpack_summary_widget .wpcom-connect' ) );
	}
}
