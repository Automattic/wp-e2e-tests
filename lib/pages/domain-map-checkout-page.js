import { By } from 'selenium-webdriver';

import BaseContainer from '../base-container.js';

export default class MapADomainCheckoutPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.checkout__payment-box-container' ) );
	}
}
