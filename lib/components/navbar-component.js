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
	hasUnreadNotifications() {
		return this.driver.findElement( by.css( '.masterbar__item-notifications' ) ).getAttribute( 'class' ).then( ( classNames ) => {
			return classNames.includes( 'has-unread' );
		} );
	}
	openNotifications() {
		const driver = this.driver;
		const notificationsSelector = by.css( '.masterbar__item-notifications' );
		return driver.findElement( notificationsSelector ).getAttribute( 'class' ).then( ( classNames ) => {
			if ( classNames.includes( 'is-active' ) === false ) {
				return driverHelper.clickWhenClickable( driver, notificationsSelector );
			}
		} );
	}
}
