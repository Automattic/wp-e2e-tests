import { By as by } from 'selenium-webdriver';
import BaseContainer from '../../base-container';
import * as driverHelper from '../../driver-helper';

export default class WPAdminTopbar extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '#wpadminbar' ) );
	}

	createNewPost() {
		const newPostSelector = by.css( '#wpadminbar li#wp-admin-bar-new-content a[href$="post-new.php"]' );
		return driverHelper.clickWhenClickable( this.driver, newPostSelector );
	}
}
