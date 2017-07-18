import { By as by } from 'selenium-webdriver';
import config from 'config';
import BaseContainer from '../../base-container';
import * as driverHelper from '../../driver-helper';

export default class BluehostInstallingWordPressPage extends BaseContainer {
	constructor( driver, visit = false ) {
		const url = config.get( 'bluehostInstallingwordPressUrl' );
		super( driver, by.css( '.mm-progress.mm-progress--working' ), visit, url );
	}

	finishesInstall() {
		// Wait for up to 2 minutes for installation to finish
		return driverHelper.waitTillPresentAndDisplayed( this.driver, by.css( '.mm-progress.mm-progress--complete' ), 120000 );
	}
}
