/** @format */
import { By, Key } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper';
import AsyncBaseContainer from '../async-base-container';

export default class GutenbergPreviewComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '#main' ) );
	}
}
