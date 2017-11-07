import { By } from 'selenium-webdriver';

import BaseContainer from '../base-container.js';

export default class DomainDetailsPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( 'main.domain-management-edit' ) );
	}
}
