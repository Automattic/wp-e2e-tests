import { By } from 'selenium-webdriver';

import BaseContainer from '../base-container.js';

export default class GuidedTourFirstStep extends BaseContainer {
	constructor( driver ) {
		super( driver, By.css( '#wpcom' ) );
	}

	isFirstStepShown() {
		if ( ! this.driver.isElementPresent( By.className( 'guided-tours__step-first' ) ) ) {
			return false;
		}
		return this.driver.wait( function( driver ) {
			return driver.findElement( By.className( 'guided-tours__step-first' ) ).isDisplayed();
		}, this.explicitWaitMS, 'Could not locate the first tour step. Check that is is displayed.' );
		// TODO(lsinger): add check for whether step is within visible bounds
	}
}
