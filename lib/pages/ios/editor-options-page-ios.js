import BaseContainerMobile from '../../base-container-mobile.js';
import { By } from 'selenium-webdriver';
import * as driverHelper from '../../driver-helper.js';

export default class EditorOptionsPage extends BaseContainerMobile {
	constructor( driver ) {
		super( driver, By.xpath( '//UIATableView[@name="SettingsTable"]' ) );

		this.tagsSelector = By.xpath( '//UIATextField[@name="Tags Value"]' );
		this.backButtonSelector = By.xpath( '//UIAButton[@name="Back"]' );
	}

	addTag( tag ) {
		return driverHelper.setWhenSettableMobile( this.driver, this.tagsSelector, `${tag},ios` );
	}

	goBack() {
		return driverHelper.clickWhenClickableMobile( this.driver, this.backButtonSelector );
	}
}
