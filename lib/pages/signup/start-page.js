import { By } from 'selenium-webdriver';
import config from 'config';

import BaseContainer from '../../base-container.js';

export default class StartPage extends BaseContainer {
	constructor( driver, { visit = true, culture = 'en', sandboxCookieValue = '' } = {} ) {
		let url;
		if ( visit === true ) {
			url = `${ config.get( 'calypsoBaseURL' ) }/start`;
		} else {
			url = driver.getCurrentUrl().then( ( urlDisplayed ) => {
				return urlDisplayed;
			} );
		}
		super( driver, By.css( '.flow-progress-indicator' ), visit, url );
		this.checkForUnknownABTestKeys();
		this.setABTestControlGroupsInLocalStorage( culture );
	}
}
