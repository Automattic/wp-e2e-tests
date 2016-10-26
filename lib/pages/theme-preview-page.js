import { By as by } from 'selenium-webdriver';
import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

export default class ThemePreviewPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.web-preview.is-visible .web-preview__content' ) );
		this.activateSelector = by.css( '.web-preview__toolbar-tray .is-primary' );
		this.customizeSelector = by.css( '.web-preview__toolbar-tray :not(.is-primary)' );
	}

	activate() {
		return driverHelper.clickWhenClickable( this.driver, this.activateSelector );
	}

	customize() {
		return driverHelper.clickWhenClickable( this.driver, this.customizeSelector );
	}
}
