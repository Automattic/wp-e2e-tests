import { By as by } from 'selenium-webdriver';
import BaseContainer from '../base-container.js';
import * as driverHelper from '../driver-helper.js';

export default class ThemePreviewPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.web-preview' ) );
		this.customizeSelector = by.css( '.web-preview__content button.is-primary' );
	}

	customize() {
		return driverHelper.clickWhenClickable( this.driver, this.customizeSelector );
	}
}
