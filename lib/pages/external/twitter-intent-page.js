import { By as by } from 'selenium-webdriver';

import BaseContainer from '../../base-container.js';

export default class TwitterIntentPage extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '#status' ) );
	}

	prefilledTweet() {
		return this.driver.findElement( by.css( '#status' ) ).then( ( e ) => {
			return e.getAttribute( 'value' ).then( ( v ) => {
				return v;
			} );
		} );
	}
};
