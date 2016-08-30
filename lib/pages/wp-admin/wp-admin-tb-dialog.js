import { By as by } from 'selenium-webdriver';
import BaseContainer from '../../base-container';
import * as driverHelper from '../../driver-helper';

export default class WPAdminTBDialog extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '#TB_window' ) );
	}

	updatedMessageShown() {
		return driverHelper.isEventuallyPresentAndDisplayed( this.driver, by.css( '#TB_window div.updated' ) );
	}

	clickOK() {
		return driverHelper.clickWhenClickable( this.driver, by.css( '#TB_window input[value="OK"]' ) );
	}
}
