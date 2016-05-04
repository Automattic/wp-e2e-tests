import { By as by } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper.js';

import BaseContainer from '../base-container.js';

export default class NavbarComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.masterbar' ) );
	}
	clickCreateNewPost() {
		const postButtonSelector = by.css( 'a.masterbar__item-new' );
		return driverHelper.clickWhenClickable( this.driver, postButtonSelector, this.explicitWaitMS );
	}
	clickProfileLink() {
		const profileSelector = by.css( 'a.masterbar__item-me' );
		return driverHelper.clickWhenClickable( this.driver, profileSelector, this.explicitWaitMS );
	}
	clickMySites() {
		const mySitesSelector = by.css( 'header.masterbar a.masterbar__item' );
		return driverHelper.clickWhenClickable( this.driver, mySitesSelector, this.explicitWaitMS );
	}
}
