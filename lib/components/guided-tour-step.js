import { By } from 'selenium-webdriver';

import BaseContainer from '../base-container.js';

export default class GuidedTourFirstStep extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '#wpcom' ) );
	}

	isFirstStepShown() {
		return this.driver.isElementPresent( By.className( 'guided-tours__step-first' ) );
	}
}
