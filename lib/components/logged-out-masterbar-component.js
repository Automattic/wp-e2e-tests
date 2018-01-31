import { By } from 'selenium-webdriver';

import BaseContainer from '../base-container.js';

export default class LoggedOutMasterbarComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.masterbar__login-links,.masterbar .nav' ) );
	}
}
