/** @format */

import { By } from 'selenium-webdriver';

import AsyncBaseContainer from '../async-base-container';

export default class NoSitesComponent extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.empty-content' ) );
	}
}
