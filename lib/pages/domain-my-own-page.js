/** @format */

import { By } from 'selenium-webdriver';

import BaseContainer from '../base-container.js';

export default class MyOwnDomainPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.transfer-domain-step__domain-description' ) );
	}
}
