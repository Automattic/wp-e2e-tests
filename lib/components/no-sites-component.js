/** @format */

import { By } from 'selenium-webdriver';

import BaseContainer from '../base-container.js';

export default class NoSitesComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.empty-content' ) );
	}
}
