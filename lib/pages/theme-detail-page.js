import { By as by } from 'selenium-webdriver';
import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

export default class ThemeDetailPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.theme__sheet.main' ) );
	}

	openLiveDemo() {
		return driverHelper.clickWhenClickable( this.driver, by.css( 'a.theme__sheet-preview-link' ) );
	}

	activateTheme() {
		return driverHelper.clickWhenClickable( this.driver, by.css( '.theme__sheet-action-bar button.theme__sheet-primary-button' ) );
	}

	goBackToAllThemes() {
		return driverHelper.clickWhenClickable( this.driver, by.css( 'a.button.header-cake__back' ) );
	}
}
