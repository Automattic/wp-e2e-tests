import { By } from 'selenium-webdriver';

import BaseContainer from '../base-container.js';

export default class MapADomainPage extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.map-domain-step' ) );
	}
}
