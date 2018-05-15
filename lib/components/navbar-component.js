/** @format */

import { By as by } from 'selenium-webdriver';
import * as driverHelper from '../driver-helper.js';

import BaseContainer from '../base-container.js';

export default class NavbarComponent extends BaseContainer {
	constructor( driver ) {
		super( driver, by.css( '.masterbar' ) );
	}
	clickCreateNewPost( { siteURL = null } = {} ) {
		const postButtonSelector = by.css( 'a.masterbar__item-new' );
		return driverHelper
			.clickWhenClickable( this.driver, postButtonSelector, this.explicitWaitMS )
			.then( () => {
				if ( siteURL !== null ) {
					return driverHelper.clickIfPresent(
						this.driver,
						by.xpath( `//div[text()="${ siteURL }"]` )
					);
				}
			} );
	}
	clickProfileLink() {
		const profileSelector = by.css( 'a.masterbar__item-me' );
		return driverHelper.clickWhenClickable( this.driver, profileSelector, this.explicitWaitMS );
	}
	async clickMySites() {
		const mySitesSelector = by.css( 'header.masterbar a.masterbar__item' );
		return await driverHelper.clickWhenClickable(
			this.driver,
			mySitesSelector,
			this.explicitWaitMS
		);
	}
	hasUnreadNotifications() {
		return this.driver
			.findElement( by.css( '.masterbar__item-notifications' ) )
			.getAttribute( 'class' )
			.then( classNames => {
				return classNames.includes( 'has-unread' );
			} );
	}
	openNotifications() {
		const driver = this.driver;
		const notificationsSelector = by.css( '.masterbar__item-notifications' );
		return driver
			.findElement( notificationsSelector )
			.getAttribute( 'class' )
			.then( classNames => {
				if ( classNames.includes( 'is-active' ) === false ) {
					return driverHelper.clickWhenClickable( driver, notificationsSelector );
				}
			} );
	}
	openNotificationsShortcut() {
		return this.driver.findElement( by.tagName( 'body' ) ).sendKeys( 'n' );
	}
	confirmNotificationsOpen() {
		const selector = by.css( '.wpnt-open' );
		return driverHelper.isEventuallyPresentAndDisplayed( this.driver, selector );
	}
	dismissGuidedTours() {
		const self = this;
		const guidedToursDialogSelector = by.css( 'div.guided-tours__step-first' );
		const guidedToursDismissButtonSelector = by.css(
			'div.guided-tours__step-first button:not(.is-primary)'
		);
		return driverHelper
			.isElementPresent( self.driver, guidedToursDialogSelector )
			.then( present => {
				if ( present === true ) {
					return driverHelper.clickWhenClickable( self.driver, guidedToursDismissButtonSelector );
				}
			} );
	}
}
